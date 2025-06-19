import './css/landingpages.css';
const button = document.getElementById('instructions-button');
const speaker = document.getElementById('speaker');

// get and store id
const subjID =
  new URL(document.location.href).searchParams.get('ID') || 'testID';

const webcam =
  new URL(document.location.href).searchParams.get('webcam') || false;

// define what happens on button click
const handleContinueClick = (event) => {
  event.preventDefault();
  window.location.href = `./mutex.html?ID=${subjID}&webcam=${webcam}`;
};

const handleWebcamClick = (event) => {
  event.preventDefault();
};

button.addEventListener('click', handleContinueClick, {
  capture: false,
});

button.addEventListener('click', handleWebcamClick, {
  capture: false,
});

const handleSpeakerClick = async (event) => {
    event.preventDefault();

    const testSoundElement = document.getElementById('instruction-sound');
    testSoundElement.play();
};

speaker.addEventListener('click', handleSpeakerClick, {
    capture: false,
    once: false,
});