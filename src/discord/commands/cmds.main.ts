import commandsConfig from './cmds.config';
import { Message } from 'discord.js';
import streams from './streams/streams.main';
import { toParams } from '@utils/discord.utils';

const { config } = commandsConfig;

async function handleCommand(msg: Message) {
  // Handle the command & params
  const tempVal = msg.content.indexOf(' ');
  const command = msg.content
    .substring(1, tempVal === -1 ? msg.content.length : tempVal)
    .toLowerCase();
  let params: string[] = [];

  if (msg.content.includes(' ')) {
    params = toParams(msg.content.substring(tempVal + 1, msg.content.length));
  }

  switch (command) {
    case 'help':
      msg.channel.send(await commandsConfig.getCommands());
      return;
  }

  if (params.length == 0) {
    return;
  }

  switch (command) {
    case 'streams':
      streams.handler(msg, params[0], params?.slice(1));
      return;

    case 'music':
      return;

    default:
      return;
  }
}

export default async function handle(msg: Message) {
  if (config.triggers.includes(msg.content.charAt(0))) {
    handleCommand(msg);
  }
}
