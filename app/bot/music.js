const essentials = require.main.require('./app/utils/essentials.js');
const { exists } = require.main.require('./app/utils/essentials.js');
const storage = require.main.require('./app/storage.js');

const { compareChans, compareRoles, compareGuilds } = require.main.require('./app/utils/helper.js');

const ytdl = require('ytdl-core');

const streamOptions = { seek: 0, volume: 0.5 };

let cmds = {};

function isInVoice(msg) {
  if (!exists(msg.guild.voiceConnection)) {
    msg.channel.send('Sorry, I\'m not currently in a voice channel.');
    return false;
  }

  return true;
}

function isStreaming(msg) {
  if (!exists(msg.guild.voiceConnection.dispatcher)) {
    msg.channel.send('Sorry, I\'m not currently playing anything.');
    return false;
  }

  return true;
}

/**
 * Finds and joins a channel that closely matches the name.
 * @param {*} msg The message that triggered this command.
 * @param {string} param The channel to join.
 */
function joinChan(msg, param) {
  const foundChan = msg.guild.channels.filter(channel => channel.type === 'voice')
    .find(channel => channel.name === param || channel.name.toLowerCase() === param.toLowerCase());

  if (!exists(foundChan)) {
    msg.channel.send(`Sorry, I couldn't find **${param}**.`);
    return;
  }

  foundChan.join()
    .then(() => { msg.channel.send(`Successfully joined **${foundChan.name}**.`); })
    .catch(() => { msg.channel.send(`Failed to find or join the channel **${param}**.`); });
}

function leaveChan(msg) {
  if (!isInVoice(msg)) {
    return;
  }
  msg.channel.send(`Alright, I left **${msg.guild.voiceConnection.channel.name}**.`);
  msg.guild.voiceConnection.channel.leave();
}

function playSong(msg, song) {
  if (!isInVoice(msg)) {
    return;
  }

  const stream = ytdl(song, { filter: 'audioonly' });
  msg.guild.voiceConnection.playStream(stream, streamOptions);
  ytdl.getInfo(song, (err, info) => {
    msg.channel.send(`Now playing **${info.title}**.`);
  });
}

function pauseSong(msg) {
  if (!isInVoice(msg) || !isStreaming(msg)) {
    return;
  }

  if (msg.guild.channel.voiceConnection.dispatcher.paused) {
    msg.channel.send('Sorry, I already paused the music.');
    return;
  }

  msg.guild.voiceConnection.dispatcher.pause();
  msg.channel.send('The song has been paused.');
}

function resumeSong(msg) {
  if (!isInVoice(msg) || !isStreaming(msg)) {
    return;
  }

  if (!msg.guild.channel.voiceConnection.dispatcher.paused) {
    msg.channel.send('Either the music is currently playing or there\'s nothing playing to pause.');
    return;
  }

  msg.guild.voiceConnection.dispatcher.resume();
  msg.channel.send('The song has been resumed.');
}

function stopSong(msg) {
  if (!isInVoice(msg) || !isStreaming(msg)) {
    return;
  }

  msg.guild.voiceConnection.dispatcher.end();
  msg.channel.send('The song has been stopped.');
}

function handle(msg, command, params) {
  const param = params != null ? params[0] : null;
  const additions = params.slice(1);

  if (param == null) {
    console.log('ERROR: !streams variable param is null. Returning.');
    return;
  }

  if (cmds.prevs.msg != null) {
    // cmds.prevs.msg.delete();
  }

  if (cmds.prevs.cmd != null) {
    // cmds.prevs.cmd.delete();
  }

  cmds.prevs.cmd = msg;

  switch (param) {
    case 'help':
      if (compareChans(msg, cmds.data[param]) && compareRoles(msg, cmds.data[param].roles) && compareGuilds(msg, cmds.data[param].guilds)) {
        const helpText = Object.keys(cmds.data).filter(key => cmds.data[key].show === true).map((key) => {
          const cmd = cmds.data[key];
          return `!${cmds.trigger} ${cmd.example}${essentials.fillSpaces(`!${cmds.trigger} ${cmd.example}`, 32)}; ${cmd.description}`;
        }).join('\n');

        msg.channel.send(`The following commands are available for the \`!${cmds.trigger}\` function:

\`\`\`ini
[ Commands ]

${helpText}\`\`\``);
      }
      break;

    case 'join':
      if (compareChans(msg, cmds.data[param]) && compareRoles(msg, cmds.data[param].roles)) {
        joinChan(msg, additions.join(' '));
      }
      break;

    case 'leave':
      if (compareChans(msg, cmds.data[param]) && compareRoles(msg, cmds.data[param].roles)) {
        leaveChan(msg);
      }
      break;

    case 'play':
      if (compareChans(msg, cmds.data[param]) && compareRoles(msg, cmds.data[param].roles)) {
        playSong(msg, additions[0]);
      }
      break;

    case 'stop':
      if (compareChans(msg, cmds.data[param]) && compareRoles(msg, cmds.data[param].roles)) {
        stopSong(msg);
      }
      break;

    case 'pause':
      if (compareChans(msg, cmds.data[param]) && compareRoles(msg, cmds.data[param].roles)) {
        pauseSong(msg);
      }
      break;

    case 'resume':
      if (compareChans(msg, cmds.data[param]) && compareRoles(msg, cmds.data[param].roles)) {
        resumeSong(msg);
      }
      break;

    default:
      break;
  }
}

function onLoad() {
  storage.getData('./storage/data/music/cmds.json', JSON.stringify(JSON.parse('{}')), (cmdData) => {
    cmds = cmdData;
    cmds.prevs = {};

    module.exports.trigger = cmds.trigger;
  });
}

module.exports.handle = handle;
module.exports.onLoad = onLoad;
