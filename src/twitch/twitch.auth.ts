import { loadCredentials, ICredentials, loadData } from '@utils/firebase.utils';
import TwitchCredentials from 'twitch';

interface ITwitchCredentials extends ICredentials {
  callback: string;
}

class TwitchAuth {
  credentials!: ITwitchCredentials;
  twitchCredentials!: TwitchCredentials;

  constructor() {
    this.loadCredentials();
  }

  async loadCredentials() {
    this.credentials = {
      ...(await loadCredentials('twitch')),
      ...(await this.loadConfig())
    };

    this.loadTwitchCredentials();
  }

  loadTwitchCredentials() {
    const { clientID, clientSecret } = this.credentials;
    this.twitchCredentials = TwitchCredentials.withClientCredentials(
      clientID,
      clientSecret
    );
  }

  async loadConfig() {
    return await loadData('twitch', 'config', { callback: '' });
  }
}

export default new TwitchAuth();
