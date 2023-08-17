# Canvas

A terminal tracker for Canvas LMS

## How to use

1. Clone / download this repository
2. Make sure you have node.js installed and npm / yarn
3. Install dependencies (pick which you have)
   1. `npm install`
   2. `yarn`
4. Duplicate the `config.example.json` to `config.json`
   1. if you are from a different institutation that uses canvas, replace the `DOMAIN` property with the link that you use to access canvas
5. Create your canvas token
   1. Go to your settings
   2. Create a new access token
      1. Listed purpose can be whatever but just put "canvas tracker"
      2. Leave expiry date blank since this is a permanent token
      3. Copy the generated token and paste it in `config.json` in the `CANVAS_TOKEN` property
6. `node index.js`
