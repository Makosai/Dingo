////
//// Variables
////
var essentials    = require.main.require("./app/utils/essentials.js")
  , conn          = require.main.require("./app/conn.js")
  , storage       = require.main.require("./app/storage.js");

var tmi           = require("tmi.js")
  , client        = new tmi.client();

var streamList = {};
/*
{
    "_id": ###########,
    "live": false // False if "stream" is null, true otherwise. If stream changes from null, notify users. Store the data so if the bot reloads it won't resend the notifcation until the bot determines that the streamer has gone offline at least once.
    "user": { . . . },
    "stream": { . . . }
}
*/

var cfg = {};
var data = {};

function handle(msg, cmd, params) {
    var param = params != null ? params[0] : null;
    
    if(param == null) {
        console.log("ERROR: !streams variable param is null. Returning.");
        return;
    }
    
    if(cmds.prevs.msg != null) {
        //cmds.prevs.msg.delete();
    }

    if(cmds.prevs.cmd != null) {
        //cmds.prevs.cmd.delete();
    }
    
    cmds.prevs.cmd = msg;

    switch(param) {
        case "help":
            if(compareChans(msg, cmds.data[param]) && compareRoles(msg, cmds.data[param].roles) && compareGuilds(msg, cmds.data[param].guilds)) {
                var helpText = Object.keys(cmds.data).filter(key => cmds.data[key].show == true).map(function(key) {
                    var cmd = cmds.data[key];
                    return `!${cmds.trigger} ${cmd.example}${essentials.fillSpaces(`!${cmds.trigger} ${cmd.example}`, 32)}; ${cmd.description}`;
                }).join('\n');
                
                msg.channel.send(`The following commands are available for the \`!${cmds.trigger}\` function:

\`\`\`ini
[ Admin-Only Commands ]

${helpText}\`\`\``);
            }
            break;

        case "list":
            if(compareChans(msg, cmds.data[param]) && compareRoles(msg, cmds.data[param].roles)) {
                listStreams(msg);
            }
            break;
            
        case "status":
            if(params[0]) {
                if(streamList.hasOwnProperty(params[1].toLowerCase())) {
                    getStream(params[1], isLive(params[1]));
                } else {
                    getDisplayName(params[1], function(displayName) {
                         msg.channel.send(`Sorry, **${displayName}** is not in the stream list.`);
                    });
                }
            }
            break;
            
        case "add":
            if(compareChans(msg, cmds.data[param]) && compareRoles(msg, cmds.data[param].roles)) {
                if(params[1]) {
                    addStream(params[1], msg);
                } else {
                    msg.channel.send("Incorrect parameters. `! add <username>`");
                }
            }
            break;
        
        case "remove":
            if(compareChans(msg, cmds.data[param]) && compareRoles(msg, cmds.data[param].roles)) {
                if(params[1]) {
                    if(streamList.hasOwnProperty(params[1])) {
                        removeStream(params[1], msg);
                    } else {
                        getDisplayName(params[1], function(displayName) {
                            removeStream(displayName, msg);
                        });
                    }
                } else {
                    msg.channel.send(`Incorrect parameters. \`!${cmds.trigger} remove <username>\``)
                }
            }
            break;
    }
}

function compareChans(msg, data) {
    if(data.categories != null && !data.categories.includes(msg.channel.parent.name))
        return false;
    
    if(data.channels != null && !data.channels.includes(msg.channel.name))
        return false;
    
    return true;
}

function compareRoles(msg, data) {
    if(msg.member == null || typeof msg.member == 'undefined') {
        return false;
    }
    
    var roles = msg.member.roles;
    
    if(roles == null || typeof roles == 'undefined') {
        return false;
    }
    
    if(data == null) {
        return true;
    }
    
    var bool = data.some(function(elem) {
        if(roles.exists('name', elem)) {
            return true;
        } else {
            return false;
        }
    });
    return bool;
}

function compareGuilds(msg, data) {
    if(data != null && !data.includes(msg.guild.name))
        return false;
    
    return true;
}


function getDisplayName(name, callback) {
    if(!callback) {
        console.log("ERROR: getDisplayName()\n\tPlease supply a callback.")
        return;
    }
    
    client.api({
        url: `https://api.twitch.tv/kraken/users?login=${name}`,
        headers: {
            "Accept": "application/vnd.twitchtv.v5+json",
            "Client-ID": cfg.CLIENT_ID
        }
    }, function(err, res, body) {
        if(body._total <= 0) {
            callback(name);
        } else {
            callback(body.users[0].display_name);
        }
    });
}

function addStream(streamer, msg) {
    streamer = streamer.toLowerCase();
    
    if(streamList.hasOwnProperty(streamer)) {
        msg.channel.send(`Sorry, **${streamList[streamer].user.display_name}** is already in the stream list.`);
        return; // The streamer is already in the list
    }
    
    client.api({
        url: `https://api.twitch.tv/kraken/users?login=${streamer}`,
        headers: {
            "Accept": "application/vnd.twitchtv.v5+json",
            "Client-ID": cfg.CLIENT_ID
        }
    }, function(err, res, body) {
        if(body._total <= 0) {
            if(msg) {
                msg.channel.send(`Sorry, **${streamer}** does not exist on Twitch.`);
            }
            return;
        }
        streamList[streamer] = {};
        streamList[streamer].live = false;
        streamList[streamer].user = body.users[0];
        streamList[streamer].stream = null;
        
        getStream(streamer);
        
        if(msg) {
            msg.channel.send(`**${streamList[streamer].user.display_name}** has been added to the stream list.`);
        }
    });
}

function removeStream(streamer, msg) {
    var input = streamer;
    streamer = streamer.toLowerCase();
    
    if(streamList.hasOwnProperty(streamer)) {
        msg.channel.send(`**${streamList[streamer].user.display_name}** was removed from the stream list.`);
        delete streamList[streamer];
    } else {
        msg.channel.send(`**${input}** could not be found in the stream list.`);
    }
    
    onSave();
}

function listStreams(msg) {
    if(Object.keys(streamList).length > 0) {
        var streams = Object.keys(streamList).map(function(key) {
            return streamList[key].user.display_name;
        });
        
        streams.sort(function(a, b) {
            return essentials.compareStrings(a, b);
        });
        
        streams = streams.join('\n');
        
        msg.channel.send(`\`\`\`ini\n[ Stream List ]\n\n${streams}\`\`\``);
    } else {
        msg.channel.send("There isn't anyone in the **stream list** to be displayed.");
    }
}

function refreshStreams() {
    Object.keys(streamList).forEach(function(streamer) {
        getStream(streamer);
    });
}

var streamLoop;

function getStream(streamer, callback) {
    streamer = streamer.toLowerCase();
    
    if(!streamList.hasOwnProperty(streamer)) {
        if(callback) {
            callback(false);
        }
        return;
    }
    
    streamer = streamList[streamer];
    
    client.api({
        url: `https://api.twitch.tv/kraken/streams/${streamer.user._id}`,
        headers: {
            "Accept": "application/vnd.twitchtv.v5+json",
            "Client-ID": cfg.CLIENT_ID
        }
    }, function(err, res, body) {
        if(typeof body == 'undefined') {
            console.log("ERROR: Twitch API rate limit has been reached.");
            return;
        }
        
        if(body.stream == null) {
            if(!streamer.stream != null) {
                streamer.stream = null;
                streamer.live = false;
            }
        } else {
            if(streamer.stream == null) {
                streamer.live = true;
                streamer.stream = body.stream;
                broadcast(streamer);
                // If stream was previously set to null, then message discord.
            } else {
                streamer.stream = body.stream;
            }
        }
        
        if(callback) {
            callback(true);
        }
        
        onSave();
    });
}

// Broadcasts to the cfg.default_channel and lets everyone know this user is online.
function broadcast(streamer) {
    var url = `https://www.twitch.tv/${streamer.user.name}`;
    var msg = `**${streamer.user.display_name}** is now live!`;
    var cast = new conn.Discord.RichEmbed();
    
    // Author
    cast = cast.setAuthor(streamer.user.display_name, streamer.stream.channel.logo, url);
    
    // Game & Viewers
    cast = cast.addField("Game", streamer.stream.game, true);
    cast = cast.addField("Viewers", streamer.stream.viewers, true);
    
    cast = cast.setColor("6441A4");
    cast = cast.setTitle(`${streamer.stream.channel.status}`);
    cast = cast.setURL(url);
    cast = cast.setImage(streamer.stream.preview.large);
    conn.client.channels.find('name', cfg.default_channel).send(msg, {"embed": cast});
}

function isLive(streamer) {
    streamer = streamer.toLowerCase();
    
    if(streamList.hasOwnProperty(streamer)) {
        var stream = streamList[streamer].stream;
        if(streamList[streamer].live) {
            message(`**${streamer}** is currently live playing **${stream.game}** with **${stream.viewers}** viewers.`);    
        } else {
            message(`**${streamer}** is currently offline.`);
        }
        
    } else {
        message(`There isn't a streamer in the queue with that name. Add them in first with \`!{cmds.trigger} add <username>\`.`);
    }
}

function message(msg, store) {
    conn.client.channels.find('name', cfg.default_channel).send(msg).then(function(message) {
        if(store) {
            cmds.prevs.msg = message;
        }
    });
}

function onLoad() {
    streamList = {};
    
    storage.getData(`./storage/data/streams/cfg.json`, JSON.stringify(JSON.parse(`{}`)), function(cfgData) {
        cfg = cfgData;
        
        streamLoop = setInterval(function() {
            refreshStreams();
        }, 1000 * 60 * cfg.refresh_rate);
    });
    
    storage.getData(`./storage/data/streams/cmds.json`, JSON.stringify(JSON.parse(`{}`)), function(cmdData) {
        cmds = cmdData;
        cmds.prevs = {};
        
        module.exports.trigger = cmds.trigger;
    });
    
    storage.getData(`./storage/data/streams/streamList.json`, JSON.stringify(JSON.parse(`{}`)), function(streamData) {
        streamList = streamData;
    });
}

function onSave() {
    storage.setData(`./storage/data/streams/streamList.json`, JSON.stringify(streamList, null, "\t"), function() { });
}

module.exports.onLoad = onLoad;
module.exports.onSave = onSave;
module.exports.handle = handle;