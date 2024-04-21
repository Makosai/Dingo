import {
  PubSubClient,
  PubSubListener,
  SingleUserPubSubClient
} from 'twitch-pubsub-client';
import TwitchAuth from './twitch.auth';
import { loadData } from '@utils/firebase.utils';
import TwitchData from './twitch.data';
import {
  ApiClient as TwitchCredentials,
  RefreshableAuthProvider,
  StaticAuthProvider
} from 'twitch';
import { debug } from '@utils/essentials.utils';

interface IPubSubTypes {
  subscription: PubSubListener;
  bits: PubSubListener;
}

class TwitchPubSub {
  pubsub!: PubSubClient;
  singlePubSub: Map<string, SingleUserPubSubClient> = new Map<
    string,
    SingleUserPubSubClient
  >();
  subscriptions: Map<string, IPubSubTypes> = new Map<string, IPubSubTypes>();
  sync: Promise<any>;

  constructor() {
    this.sync = Promise.all([this.loadPubSub()]);
  }

  private async loadPubSub() {
    this.pubsub = new PubSubClient();

    for (const channel of TwitchData.data.channels) {
      const user = await TwitchAuth.twitchCredentials.helix.users.getUserByName(
      channel
      );

      if (user === null) {
      throw new Error(
        `Couldn't find ${channel} on Twitch to load twitch/data/${channel}.`
      );
      }

      const data = await loadData(`twitch/data/${channel}`, 'credentials', {
      token: ''
      });

      if (data.token === '') {
      throw new Error(
        `Please set a token for twitch/data/${channel}/credentials.`
      );
      }

      const { clientID, clientSecret } = TwitchAuth.credentials;
      const { token, refreshToken } = data;

      const twitchClient = new TwitchCredentials({
      authProvider: new RefreshableAuthProvider(
        new StaticAuthProvider(
        clientID,
        token,
        ['channel_subscriptions', 'bits:read'],
        'user'
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

      await this.pubsub
      .registerUserListener(twitchClient, user)
      .catch((e) => debug(e));
    }
  }
}

export default new TwitchPubSub();
