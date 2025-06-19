import './css/mutex.css';
import * as mrec from '@ccp-eva/media-recorder';
import * as DetectRTC from 'detectrtc';

import { downloadData } from './js/downloadData.js';
import { uploadData } from './js/uploadData.js';
import { pause } from './js/pause.js';
// import { hideURLparams } from './js/hideURLparams.js';
import { openFullscreen } from './js/openFullscreen.js';
import { checkForTouchscreen } from './js/checkForTouchscreen.js';
// import { randomizeNewTrials } from './js/randomizeNewTrials.js';
import { getUniqueTrial } from './js/getUniqueTrial.js';
import { shuffleArray } from './js/shuffleArray.js';
import { noSamePos } from './js/noSamePos.js';

document.addEventListener('DOMContentLoaded', function () {
  const devmode = false;

  //------------------------------------------------------------------
  // automatically add running trial numbers as ids to html
  //------------------------------------------------------------------
  const trialDivs = document.querySelectorAll('.trials');

  // Iterate over trial divs and set their IDs
  //trialDivs.forEach((div, index) => {
  //  div.id = `trial${index}`;
  //});

  //------------------------------------------------------------------
  // create object to save data
  //------------------------------------------------------------------
  const responseLog = {
    // get ID out of URL parameter
    meta: {
      subjID:
        new URL(document.location.href).searchParams.get('ID') || 'testID',
      order: window.location.pathname.split('/').pop().replace('.html', ''),
      touchscreen: checkForTouchscreen(),
      webcam:
        new URL(document.location.href).searchParams.get('webcam') === 'true' ||
        false,
    },
    data: [],
  };

  // hide url parameters
  // hideURLparams();

  //------------------------------------------------------------------
  // log user testing setup
  //------------------------------------------------------------------
  DetectRTC.load(() => {
    responseLog.meta.os = DetectRTC.osName;
    responseLog.meta.browser = DetectRTC.browser.name;
    responseLog.meta.browserVersion = JSON.stringify(DetectRTC.browser.version);
    responseLog.meta.safari = DetectRTC.browser.isSafari || false;
    responseLog.meta.iOSSafari =
      responseLog.meta.touchscreen && responseLog.meta.safari;

    if (devmode) console.log(responseLog.meta);
  });

  //------------------------------------------------------------------
  // study variables
  //------------------------------------------------------------------
  let trialNr = 0;
  let t0 = 0;
  let t1 = 0;

  //------------------------------------------------------------------
  // get relevant elements
  //------------------------------------------------------------------
  //const allAudios = document.getElementsByTagName('audio');
  const allAudios = document.getElementById('audio');
  const trialDiv = document.getElementById('trialInterface');
  const row = document.getElementById('objectsrow');
  const betweenTrials = document.getElementById('between-trials');
  const betweenTrialsBackround = document.getElementById('between-trials-background');
  const button = document.getElementById('mutex-button');
  const speaker = document.getElementById('speaker');
  const headingFullscreen = document.getElementById('heading-fullscreen');
  const headingTestsound = document.getElementById('heading-testsound');
  const flexWrapper = document.getElementById('flex-wrapper');

  //------------------------------------------------------------------
  // define response click
  //------------------------------------------------------------------
  const handleResponseClick = async (event) => {
    event.preventDefault();

    // Prevent clicks on the img element with id="character"
    if (event.target.id === 'character') {
      return;
    }

    t1 = new Date().getTime();

    //const currentTrial = document.getElementById(`trial${trialNr - 1}`);
    const currentImages = Array.from(row.getElementsByTagName('img'));
    currentImages.forEach((img) => {
      img.style.border = '0.3vw solid transparent';
    });

    event.target.style.border = '0.3vw solid blue';

    if ((trialNr - 1) != 1 && (trialNr - 1) != 2 && (trialNr - 1) != 3) {
      // save response
      // trial - 2 since array starts at zero (-1) and continue click already advanced trial count (-1)
      responseLog.data[trialNr] = {
        timestamp: new Date(parseInt(t1)).toISOString(),
        responseTime: t1 - t0,
        trial: trialNr - 2,
        // split('/').pop(): splits string at / and keeps only last element
        // then remove N_ and .jpg
        targetWord: 't',
        itemNr: allAudios.src
          .split('/')
          .pop()
          .replace('n_', '')
          .replace('v_', '')
          .replace('a_', '')
          .replace('f1_', '')
          .replace('f2_', '')
          .replace('_audio.mp3', ''),
        chosenWord: event.target.src
          .split('/')
          .pop()
          .replace('n_', '')
          .replace('v_', '')
          .replace('a_', '')
          .replace('f1_', '')
          .replace('f2_', '')
          .replace('1_', '')
          .replace('2_', '')
          .replace('3_', '')
          .replace('4_', '')
          .replace('5_', '')
          .replace('6_', '')
          .replace('.svg', '')
          .replace('.gif', ''),
        chosenPosition: event.target.id,
        wordClass: allAudios.src.split('/').pop().startsWith('n_')
          ? 'noun'
          : allAudios.src.split('/').pop().startsWith('v_')
          ? 'verb'
          : allAudios.src.split('/').pop().startsWith('a_')
          ? 'adjective'
          : allAudios.src.split('/').pop().startsWith('f1_')
          ? 'filler1'
          : allAudios.src.split('/').pop().startsWith('f2_')
          ? 'filler2'
          : 'unknown',
        };
      } 
      else if ((trialNr - 1) == 1 || (trialNr - 1) == 2 || (trialNr - 1) == 3) {
        // save response  
        responseLog.data[trialNr] = {
        timestamp: new Date(parseInt(t1)).toISOString(),
        responseTime: t1 - t0,
        trial: trialNr - 2,
        // split('/').pop(): splits string at / and keeps only last element
        // then remove N_ and .jpg
        targetWord: allAudios.src.split('/').pop().replace('.mp3', ''),
        itemNr: `${trialNr - 1}`,
        chosenWord: event.target.src.split('/').pop().replace('.svg', ''),
        chosenPosition: event.target.id,
        wordClass: "familiarization",
      }
    };

    button.addEventListener('click', handleContinueClick, {
      capture: false,
      once: true,
    });
  };
  
  //------------------------------------------------------------------
  // define continue click
  //------------------------------------------------------------------

  const alreadyAppearedTrials = [];
  const lastTwoLetters = [];
  const lastTwoPos = [];
  const positions = ['left', 'central', 'right']; 
  let counterN = 0; // Initialize counter for nouns
  let counterA = 0; // Initialize counter for adjectives
  let counterV = 0; // Initialize counter for verbs
  let counterF1 = 0; // Initialize counter for fillers
  let counterF2 = 0; // Initialize counter for fillers
  

  const handleContinueClick = async (event) => {
    event.preventDefault();

    if (devmode) {
      console.log('trialNr', trialNr);
      console.log(allAudios);
      console.log(responseLog);
    }

    

    // enable fullscreen and have short break, before first trial starts
    if (trialNr === 0) {
      if (!devmode & !responseLog.meta.iOSSafari); openFullscreen();
      headingFullscreen.style.display = 'none';
      headingTestsound.style.display = 'inline';
      speaker.setAttribute('visibility', 'visible');
      await pause(1000);
      // for safari, first sound needs to happen on user interaction
      const testSoundElement = document.getElementById('testsound');
      if (testSoundElement) {
        testSoundElement.play();
      } else {
        console.warn('Element with ID "testsound" not found.');
      }

      await pause(1000);

      button.addEventListener('click', handleContinueClick, {
        capture: false,
        once: true,
      });
    }

    // end of trials
    if (trialNr === 34) {
      downloadData(responseLog.data, responseLog.meta.subjID);
      uploadData(responseLog.data, responseLog.meta.subjID);

      // save the video locally
      if (!responseLog.meta.iOSSafari && responseLog.meta.webcam) {
        mrec.stopRecorder();

        // give some time to create Video Blob

        const day = new Date().toISOString().substring(0, 10);
        const time = new Date().toISOString().substring(11, 19);

        setTimeout(
          () =>
            mrec.downloadVideo(
              `mutex-${responseLog.meta.subjID}-${day}-${time}`,
            ),
          1000,
        );
      }

      await pause(1000);

      window.location.href = `./goodbye.html?ID=${responseLog.meta.subjID}`;
    }
        

    if (trialNr > 0) {
      headingTestsound.style.display = 'none';
      // pause audio (that might be playing if speaker item was clicked and prompt was repeated)
      // Stop any audio that is still playing
      const audios = document.getElementsByTagName('audio');
      Array.from(audios).forEach(audio => {
        audio.pause();
        audio.currentTime = 0;
      });
      

      betweenTrialsBackround.style.opacity = 1;

      const trialImages = trialDiv.getElementsByTagName('img');
      Array.from(trialImages).forEach((img) => {
        if (img.id !== 'background') {
          img.style.border = '0.3vw solid transparent';
        }
      });

      //-------------------------------------------------
      // get new trial
      //-------------------------------------------------

      // Familiarization trials

      if (trialNr === 1) {
        document.getElementById('left').src = `images/items/lemon.svg`;
        document.getElementById('central').src = `images/items/truck.svg`;
        document.getElementById('right').src = `images/items/turtle.svg`;
        allAudios.src = `audio/lemon.mp3`;
      }
      else if (trialNr === 2) {
        document.getElementById('left').src = `images/items/helicopter.svg`;
        document.getElementById('central').src = `images/items/cat.svg`;
        document.getElementById('right').src = `images/items/choco_icecream.svg`;
        allAudios.src = `audio/cat.mp3`;
      }
      else if (trialNr === 3) {
        document.getElementById('left').src = `images/items/hamster.svg`;
        document.getElementById('central').src = `images/items/orange.svg`;
        document.getElementById('right').src = `images/items/plant.svg`;
        allAudios.src = `audio/plant.mp3`;
      }
      else if (trialNr > 3) {
        const uniqueTrial = getUniqueTrial(alreadyAppearedTrials, lastTwoLetters, counterN, counterA, counterV, counterF1, counterF2);
        console.log('Trial:', uniqueTrial);

        console.log('counters:', counterN, counterA, counterV, counterF1, counterF2);

        if (uniqueTrial.charAt(0) == 'a') {
          if (counterA < 2) {
            counterA++;
          }
        } else if (uniqueTrial.charAt(0) == 'n') {
          if (counterN < 2) {
            counterN++;
          }
        } else if (uniqueTrial.charAt(0) == 'v') {
          if (counterV < 2) {
            counterV++;
          }
        } else if (uniqueTrial.startsWith('f1')) {
          if (counterF1 < 2) {
            counterF1++;
          }
        } else if (uniqueTrial.startsWith('f2')) {
          if (counterF2 < 2) {
            counterF2++;
          }
        }

        if (counterA == 2 && counterN == 2 && counterV == 2 && counterF1 == 2 && counterF2 == 2) {
          counterA = 0;
          counterN = 0;
          counterV = 0;
          counterF1 = 0;
          counterF2 = 0;
        }

        // Shuffle for new positions

        let newPositions = shuffleArray(positions);
    
        // Make sure target was not in the same position as previous two trials
        if (lastTwoPos.length >= 2) {
          while (noSamePos(newPositions[2], lastTwoPos[0], lastTwoPos[1]) == false) {
            newPositions = shuffleArray(positions);
          }
          lastTwoPos.shift(); // remove the oldest position
        }

        lastTwoPos.push(newPositions[2]); // append the new position to the array

        // Updating the filenames of images and audios of the chosen item for this trial
        if (uniqueTrial.startsWith('f1_3') || uniqueTrial.startsWith('f1_4') || uniqueTrial.startsWith('f2_3') || uniqueTrial.startsWith('f2_4')) {
          document.getElementById(newPositions[0]).src = `images/items/${uniqueTrial}_d1.gif`;
          document.getElementById(newPositions[1]).src = `images/items/${uniqueTrial}_d2.gif`;
          document.getElementById(newPositions[2]).src = `images/items/${uniqueTrial}_t.gif`;
        } else if (!uniqueTrial.startsWith('v') && !uniqueTrial.startsWith('f1_3') && !uniqueTrial.startsWith('f1_4') && !uniqueTrial.startsWith('f2_3') && !uniqueTrial.startsWith('f2_4')) {
          document.getElementById(newPositions[0]).src = `images/items/${uniqueTrial}_d1.svg`;
          document.getElementById(newPositions[1]).src = `images/items/${uniqueTrial}_d2.svg`;
          document.getElementById(newPositions[2]).src = `images/items/${uniqueTrial}_t.svg`;
        } else if (uniqueTrial.startsWith('v')) {
          document.getElementById(newPositions[0]).src = `images/items/${uniqueTrial}_d1.gif`;
          document.getElementById(newPositions[1]).src = `images/items/${uniqueTrial}_d2.gif`;
          document.getElementById(newPositions[2]).src = `images/items/${uniqueTrial}_t.gif`;
        }

        allAudios.src = `audio/${uniqueTrial}_audio.mp3`;
        console.log(alreadyAppearedTrials);
      }
      // should finish here

      await pause(150);   

      betweenTrials.style.display = 'none';

      document.body.style.backgroundSize = "cover";
      document.body.style.backgroundPosition = "center";
      
      flexWrapper.style.backgroundColor = 'transparent';

      trialDiv.style.display = 'block';

      const currentImages = Array.from(trialDiv.getElementsByTagName('img'));

      // Clear any previous listeners
      currentImages.forEach((img) => {
        const newImg = img.cloneNode(true);
        img.replaceWith(newImg);
      });

      const updatedImages = Array.from(trialDiv.getElementsByTagName('img'));

      // Add click listeners only after audio ends
      allAudios.onended = () => {
        // save response time start point
        t0 = new Date().getTime();

        updatedImages.forEach((img) => {
          if (img.id !== 'character') {
            img.addEventListener('click', handleResponseClick, {
              capture: false,
              once: false,
            });
          }
        });
      };

      // Play audio after attaching the onended listener
      try {
        await allAudios.play();
      } catch (err) {
        console.warn('Audio playback failed:', err);
      }
    }
    trialNr++;
  };

  //------------------------------------------------------------------
  // define speaker click
  //------------------------------------------------------------------
  const handleSpeakerClick = async (event) => {
    event.preventDefault();

    // use trial - 1 since the trial count already went up in the continue click function
    // pause audio
    if (trialNr === 1) {
      const testSoundElement = document.getElementById('testsound');
      if (testSoundElement) {
        testSoundElement.play();
      } else {
        console.warn('Element with ID "testsound" not found.');
      }
    } else if (trialNr > 1) {

      if (trialNr > 1) {
        allAudios.pause();
        allAudios.currentTime = 0;
      }

      // play audio of current trial
      if (allAudios) {
        allAudios.play();
      } else {
        console.warn('Element with ID "audio" not found.');
      }
    }
  };

  //------------------------------------------------------------------
  // add eventListeners
  //------------------------------------------------------------------
  button.addEventListener('click', handleContinueClick, {
    capture: false,
    once: true,
  });

  speaker.addEventListener('click', handleSpeakerClick, {
    capture: false,
    once: false,
  });

  // ---------------------------------------------------------------------------------------------------------------------
  // START TRIALS
  // ---------------------------------------------------------------------------------------------------------------------
  // browser takes time for webcam permission
  const startTrials = async () => {
    await pause(500);

    // ---------------------------------------------------------------------------------------------------------------------
    // FOR DEMO: Conditional Recording based on URL Params (only if not iOS Safari)
    // ---------------------------------------------------------------------------------------------------------------------
    if (!responseLog.meta.iOSSafari && responseLog.meta.webcam) {
      mrec.startRecorder({
        audio: true,
        video: {
          frameRate: {
            min: 10,
            ideal: 25,
            max: 30,
          },
          width: {
            min: 640,
            ideal: 1280,
            max: 1920,
          },
          height: {
            min: 480,
            ideal: 720,
            max: 1080,
          },
          facingMode: 'user',
        },
      });
    }

    await pause(2500);

    button.style.display = 'inline';
    button.disabled = false;
  };
  startTrials();

});


