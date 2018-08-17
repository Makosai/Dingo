const fs = require('fs');

const essentials = require.main.require('./app/utils/essentials.js');
const conn = require.main.require('./app/conn.js');
const bot = require.main.require('./app/bot.js');
const streams = require.main.require('./app/bot/streams.js');
const music = require.main.require('./app/bot/music.js');


/**
 * Get the data from the .json file at the filepath.
 * @param {string} filepath
 * @param {any} defaultData
 * @param {Function} callback
 */
function getData(filepath, defaultData, callback) {
  essentials.checkForFile(filepath, defaultData || '', () => {
    fs.readFile(filepath, 'utf8', (err, contents) => {
      if (contents.length > 0) {
        callback(JSON.parse(contents));
      } else {
        callback(JSON.parse(defaultData));
      }
    });
  });
}

function setData(filepath, defaultData, callback) {
  essentials.writeFileSync(filepath, defaultData, callback);
}

function load() {
  // Set an asynchronous looped check to see if conn has loaded.
  //  If so, then run onLoad for everything.
  const interval = setInterval(() => {
    // If conn is loaded, then the rest should surely be loaded.
    if (conn.onLoad) {
      conn.onLoad();
      // bot.onLoad();
      streams.onLoad();
      music.onLoad();
      clearInterval(interval);
    }
  }, 10);
}

load();

module.exports.getData = getData;
module.exports.setData = setData;
module.exports.load = load;
