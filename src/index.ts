// Ordered Imports
import './aliases';
import './config';
import '@discord/discord.main';
import Twitch from './twitch/twitch.config';

// Utilities
import { debug } from '@utils/essentials.utils';

process.on('SIGINT', () => {
  // unsubscribe from all topics
  Twitch.webhook.unsubscribe('*');

  /* or unsubscribe from each one individually
  Twitch.webhook.unsubscribe('users/follows', {
    first: 1,
    to_id: 12826
  }); */

  process.exit(0);
});

debug('Dingo!!', true);
