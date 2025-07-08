import './css/landingpages.css';
const button = document.getElementById('instructions-button');
const speaker = document.getElementById('speaker')

const storedChoices = localStorage.getItem('storedChoices');
let studyChoices;

if (storedChoices) {
  studyChoices = JSON.parse(storedChoices);
} else {
  console.error('No data found in local storage');
}

// get and stored subject ID and webcam choice

studyChoices.ID = studyChoices?.ID ?? 'testID';
studyChoices.webcam = studyChoices?.webcam ?? false;


// define what happens on button click
const handleContinueClick = (event) => {
  event.preventDefault();
  localStorage.setItem('storedChoices', JSON.stringify(studyChoices));
  window.location.href = `./mutex.html`;
};

const handleWebcamClick = (event) => {
  event.preventDefault();
};

button.addEventListener('click', handleContinueClick, {
    capture: false,
  });

const handleWebcamClick = (event) => {
  event.preventDefault();
};

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
