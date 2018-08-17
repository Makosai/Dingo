// //
// // Variables
// //
const essentials = require.main.require('./app/utils/essentials.js');
require.main.require('./app/conn.js');
require.main.require('./app/storage.js');

const streams = require.main.require('./app/bot/streams.js');
const music = require.main.require('./app/bot/music.js');

const cmdTrigger = ['!', '.', '?'];

// / Determine the command that is wanted to be ran.
// / Then, run the respective function or functionality.
function handleCommand(msg) {
  // Handle the command & params
  const tempVal = msg.content.indexOf(' ');
  const command = (msg.content.substring(1, tempVal === -1 ? msg.content.length : tempVal)).toLowerCase();
  let params = null;

  if (msg.content.includes(' ')) {
    params = essentials.toParams(msg.content.substring(tempVal + 1, msg.content.length));
  }

  switch (command) {
    case 'streams':
      streams.handle(msg, command, params);
      break;

    case 'music':
      music.handle(msg, command, params);
      break;

    default:
      break;
  }
}

function handle(msg) {
  if (cmdTrigger.includes(msg.content.charAt(0))) {
    handleCommand(msg);
  }
}

module.exports.handle = handle;
