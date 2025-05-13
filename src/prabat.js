import './css/prabat.css';
import * as mrec from '@ccp-eva/media-recorder';
import * as DetectRTC from 'detectrtc';

import { downloadData } from './js/downloadData.js';
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
  const button = document.getElementById('prabat-button');
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

    // save response
    // trial - 2 since array starts at zero (-1) and continue click already advanced trial count (-1)
    responseLog.data[trialNr - 2] = {
      timestamp: new Date(parseInt(t1)).toISOString(),
      responseTime: t1 - t0,
      trial: trialNr - 1,
      // split('/').pop(): splits string at / and keeps only last element
      // then remove N_ and .jpg
      targetWord: 'T',
      itemNr: allAudios.src
        .split('/')
        .pop()
        .replace('N_', '')
        .replace('V_', '')
        .replace('A_', '')
        .replace('_audio.mp3', ''),
      chosenWord: event.target.src
        .split('/')
        .pop()
        .replace('N_', '')
        .replace('V_', '')
        .replace('A_', '')
        .replace('1_', '')
        .replace('2_', '')
        .replace('3_', '')
        .replace('4_', '')
        .replace('5_', '')
        .replace('6_', '')
        .replace('.svg', ''),
      chosenPosition: event.target.id,
      wordClass: allAudios.src.split('/').pop().startsWith('N_')
        ? 'noun'
        : allAudios.src.split('/').pop().startsWith('V_')
        ? 'verb'
        : allAudios.src.split('/').pop().startsWith('A_')
        ? 'adjective'
        : 'unknown',
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
    
  const handleContinueClick = async (event) => {
    event.preventDefault();

    if (devmode) {
      console.log('trialNr', trialNr);
      console.log(allAudios);
      console.log(responseLog);
    }

    

    // enable fullscreen and have short break, before first trial starts
    if (trialNr === 0) {
      if (!devmode & !responseLog.meta.iOSSafari); //openFullscreen();
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
    if (trialNr === 19) {
      downloadData(responseLog.data, responseLog.meta.subjID);

      // save the video locally
      if (!responseLog.meta.iOSSafari && responseLog.meta.webcam) {
        mrec.stopRecorder();

        // give some time to create Video Blob

        const day = new Date().toISOString().substring(0, 10);
        const time = new Date().toISOString().substring(11, 19);

        setTimeout(
          () =>
            mrec.downloadVideo(
              `prabat-${responseLog.meta.subjID}-${day}-${time}`,
            ),
          1000,
        );
      }

      await pause(1000);

      window.location.href = `./goodbye.html?ID=${responseLog.meta.subjID}`;
    }
    
    

    // hide last Trial, show background (empty pictures) instead
    if (trialNr > 0) {
      headingTestsound.style.display = 'none';
      // pause audio (that might be playing if speaker item was clicked and prompt was repeated)
      allAudios.pause();
      allAudios.currentTime = 0;

      betweenTrialsBackround.style.opacity = 1;

      const trialImages = trialDiv.getElementsByTagName('img');
      Array.from(trialImages).forEach((img) => {
        img.style.border = '0.3vw solid transparent';
      });

      //-------------------------------------------------
      // get new trial
      //-------------------------------------------------

      

      const uniqueTrial = getUniqueTrial(alreadyAppearedTrials, lastTwoLetters, counterN, counterA, counterV);
      console.log('Trial:', uniqueTrial);

      console.log('counters:', counterN, counterA, counterV);

      if (uniqueTrial.charAt(0) == 'A') {
        if (counterA < 2) {
          counterA++;
        }
      } else if (uniqueTrial.charAt(0) == 'N') {
        if (counterN < 2) {
          counterN++;
        }
      } else if (uniqueTrial.charAt(0) == 'V') {
        if (counterV < 2) {
          counterV++;
        }
      }      

      if (counterA == 2 && counterN == 2 && counterV == 2) {
        counterA = 0;
        counterN = 0;
        counterV = 0;
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
      document.getElementById(newPositions[0]).src = `images/items/${uniqueTrial}_d1.svg`;
      document.getElementById(newPositions[1]).src = `images/items/${uniqueTrial}_d2.svg`;
      document.getElementById(newPositions[2]).src = `images/items/${uniqueTrial}_T.svg`;
      allAudios.src = `audio/${uniqueTrial}_audio.mp3`;
      console.log(alreadyAppearedTrials);

      await pause(150);

      allAudios.play();

      await pause(0);

      // save response time start point
      t0 = new Date().getTime();

      betweenTrials.style.display = 'none';

      document.body.style.backgroundSize = "cover";
      document.body.style.backgroundPosition = "center";
      
      flexWrapper.style.backgroundColor = 'transparent';

      trialDiv.style.display = 'block';

      const currentImages = Array.from(
        trialDiv.getElementsByTagName('img'),
      );

      allAudios.onended = () => {
        currentImages.forEach((img) => {
          img.addEventListener('click', handleResponseClick, {
            capture: false,
            once: false,
          });
        });
      };
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
    if (trialNr > 1) {
      allAudios.pause();
      allAudios.currentTime = 0;
    }

    // play audio of current trial
    allAudios.play();
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


