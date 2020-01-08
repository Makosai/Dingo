import { loadCredentials, ICredentials } from '@utils/firebase.utils';
import TwitchCredentials from 'twitch';

interface ITwitchCredentials extends ICredentials {}

class TwitchAuth {
  credentials!: ITwitchCredentials;
  twitchCredentials!: TwitchCredentials;

  sync: Promise<any>;

  constructor() {
    this.sync = Promise.all([this.loadCredentials()]);
  }

  async loadCredentials() {
    this.credentials = await loadCredentials('twitch');

    await this.loadTwitchCredentials();
  }

  async loadTwitchCredentials() {
    const { clientID, token } = this.credentials;

    this.twitchCredentials = await TwitchCredentials.withCredentials(
      clientID,
      token
    );
  }
}

export default new TwitchAuth();
