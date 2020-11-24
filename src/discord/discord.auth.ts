import { client } from './discord.main';
import { loadCredentials, ICredentials } from '@utils/firebase.utils';
import { debug } from '@utils/essentials.utils';

// tslint:disable-next-line: no-empty-interface
interface IDiscordCredentials extends ICredentials {}

class DiscordAuth {
  credentials!: IDiscordCredentials;

  constructor() {
    this.loadCredentials().catch((err) => {
      debug(err);
    });
  }

  async loadCredentials() {
    this.credentials = await loadCredentials('discord');

    client.login(this.credentials.token).catch((e) => debug(e, true));
  }
}

export default new DiscordAuth();
