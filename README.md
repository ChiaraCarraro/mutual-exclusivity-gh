# MutEx: An open mutual exclusivity task for pre-school children

### Usage

Link to task (in German): https://devpsy.web.leuphana.de/mutual-exclusivity

### Structure

```
.
├── fetchdata                    <-- scripts for uploading data to server
|    ├── data.php
|    └── upload_video.php
├── public
|    ├── audio                   <-- all audio prompts
|    ├── data                    <-- folder where participant data will be saved
|    ├── images                  <-- all stimulus pictures. Nouns start with N_, verbs with V_
|    ├── logos                   <-- logos for website
|    └── movies                  <-- gifs for start and end of study
├── src                          <-- folder containing all CSS and JavaScript for functionality
|    ├── css                     <-- folder containing all CSS styles (for landing pages and study itself)
|    ├── js                      <-- folder containing all auxiliary functions in JavaScript
|    ├── goodbye.js              <-- functionality for last html page after study is over
|    ├── index.js                <-- functionality for very first html page
|    ├── instructions.js         <-- functionality for instructions html page before the study starts
|    └── mutex.js                 <-- functionality for the study itself
└── ...some more config files

```

### Development

Development requires [Node.js](https://nodejs.org/en/)

#### Local Development

1. `git clone git@github.com:chiaracarraro/mutual-exclusivity-gh.git`
1. `npm install`
1. `npm start`

#### Deploy Application To A Server

1. `git clone git@github.com:chiaracarraro/mutual-exclusivity-gh.git`
1. `npm install`
1. `npm run build`
1. Upload the contents within the `dist` folder to your web hoster.
