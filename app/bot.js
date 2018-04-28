////
//// Variables
////
var essentials    = require.main.require("./app/utils/essentials.js")
  , conn          = require.main.require("./app/conn.js")
  , storage       = require.main.require("./app/storage.js");

var cmdTrigger = ["!", ".", "?"];

////
//// Functions
////
function handle(msg) {
    if( cmdTrigger.includes(msg.content.charAt(0)) ) {
        handleCommand(msg);
    }
}

/// Determine the command that is wanted to be ran.
/// Then, run the respective function or functionality.
function handleCommand(msg) {
    // Handle the command & params
    var tempVal = msg.content.indexOf(' ');
    var command = (msg.content.substring(1, tempVal == -1 ? msg.content.length : tempVal)).toLowerCase();
    var params = null;
    
    if (msg.content.includes(' ')) {
        params = essentials.toParams(msg.content.substring(tempVal + 1, msg.content.length));
    }
    
    switch(command) {
        default:
            break;
    }
}

module.exports.handle = handle;