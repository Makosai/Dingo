/////
// External Reference Variables
/////
const fs = require("fs");
const essentials = require.main.require("./app/utils/essentials.js");

const conn    = require.main.require("./app/conn.js");

/////
// Variables
/////

/////
// Functions
/////

// Get the data from the .json file at the filepath.
function getData(filepath, defaultData, callback) {
    essentials.checkForFile(filepath, defaultData ? defaultData : "", function() {
        fs.readFile(filepath, 'utf8', function(err, contents) {
            
            if(contents.length > 0) {
                callback(JSON.parse(contents));
            }
            else {
                callback(JSON.parse(defaultData));
            }
        });
    });
}

function setData(filepath, defaultData, callback) {
    essentials.writeFileSync(filepath, defaultData, callback);
}

function load() {
    // Set an asynchronous looped check to see if conn has loaded. If so, then run onLoad for everything.
    var interval = setInterval(function() {
        // If conn is loaded, then the rest should surely be loaded.
        if(conn.onLoad) {
            conn.onLoad();
            clearInterval(interval);
        }
    }, 10);
}

load();

module.exports.getData = getData;
module.exports.setData = setData;
module.exports.load = load;