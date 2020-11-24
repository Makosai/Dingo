import { loadCredentials, ICredentials } from '@utils/firebase.utils';
import {
  ApiClient as TwitchCredentials,
  RefreshableAuthProvider,
  StaticAuthProvider
} from 'twitch';

// tslint:disable-next-line: no-empty-interface
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
    const { clientID, clientSecret, token, refreshToken } = this.credentials;

    this.twitchCredentials = new TwitchCredentials({
      authProvider: new RefreshableAuthProvider(
        new StaticAuthProvider(
          clientID,
          token,
          ['chat:read', 'chat:edit'],
          'user' /* bot token */
        ),
        {
          clientSecret,
          refreshToken,
          onRefresh: (newToken) => {
            // do things with the new token data, e.g. save them in your database
          }
        }
      )
    });
  }
}

export default new TwitchAuth();
