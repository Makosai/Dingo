import { client } from '@discord/discord.main';
import { debug } from '@utils/essentials.utils';

client.on('ready', () => {
  debug(`Logged in as ${client.user.tag}.`, true);
});
