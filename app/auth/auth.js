// Core variables
const fs = require("fs");
const essentials = require.main.require("./app/utils/essentials.js");

// Authentication variables
var token = ""; // optional -- Place your token here: /storage/auth/token.txt

/* *
* * Logs into Discord.
* * params: {
* *     "client": "The client variable in the app/conn.js file."
* * }
* */
function login(client) {
	essentials.checkForFile('storage/auth/token.txt', token, function() {
        fs.readFile('storage/auth/token.txt', 'utf8', function(err, contents) {
            if(contents.length > 0)
                token = contents;

            if(token)
                client.login(token);
            else
                console.log("ERROR: LOGIN FAILED -- NO TOKEN PROVIDED");
        });
    });
}

// Exports
module.exports.fs = fs;
module.exports.essentials = essentials;
module.exports.login = login;