// Discord variables
const Discord    = require("discord.js")
    , client     = new Discord.Client();

// External files
var auth         = require.main.require("./app/auth/auth.js")
  , bot          = require.main.require("./app/bot.js");

client.on('ready', () => {
    console.log(`Logged in as ${client.user.username}!`);
    
    client.user.setActivity('twitch.tv/QuaintShanty', { type: 'STREAMING', url: 'https://twitch.tv/quaintshanty'});
});

// Refreshes listeners
function listen() {
    client.removeAllListeners('message');
    client.on('message', msg => {
        if(msg.content === 'ping') {
            msg.reply('Pong!');
        }

        bot.handle(msg);
    });
}

auth.login(client);

function onLoad() {
    listen();
}

// Exports
module.exports.Discord = Discord;
module.exports.client = client;
module.exports.auth = auth;
module.exports.onLoad = onLoad;