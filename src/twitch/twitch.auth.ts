import { loadCredentials, ICredentials } from '@utils/firebase.utils';

interface ITwitchCredentials extends ICredentials {}

class TwitchAuth {
  credentials: ITwitchCredentials | undefined;

  constructor() {
    this.loadCredentials();
  }

  async loadCredentials() {
    this.credentials = await loadCredentials('twitch');
  }
}

export default new TwitchAuth();
