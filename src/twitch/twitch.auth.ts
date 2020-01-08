import { loadCredentials, ICredentials, loadData } from '@utils/firebase.utils';
import TwitchCredentials from 'twitch';

interface ITwitchCredentials extends ICredentials {}

class TwitchAuth {
  credentials!: ITwitchCredentials;
  twitchCredentials!: TwitchCredentials;

  constructor() {
    this.loadCredentials();
  }

  async loadCredentials() {
    this.credentials = await loadCredentials('twitch'));

    this.loadTwitchCredentials();
  }

  loadTwitchCredentials() {
    const { clientID, clientSecret } = this.credentials;
    this.twitchCredentials = TwitchCredentials.withClientCredentials(
      clientID,
      clientSecret
    );
  }
}

export default new TwitchAuth();
