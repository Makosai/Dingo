import { client } from '@discord/discord.main';
import handle from '@discord/commands/cmds.main';

client.on('message', msg => {
  if (msg.content === 'ping') {
    msg.reply('Pong!');
  }

  handle(msg);
});
