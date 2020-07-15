import PubSubClient, {
  PubSubListener,
  SingleUserPubSubClient
} from 'twitch-pubsub-client';
import TwitchAuth from './twitch.auth';
import { loadData } from '@utils/firebase.utils';
import TwitchData from './twitch.data';
import TwitchCredentials from 'twitch';
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

    TwitchData.data.channels.forEach(async (channel) => {
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

      const twitchClient = await TwitchCredentials.withCredentials(
        TwitchAuth.credentials.clientID,
        data.token,
        ['channel_subscriptions', 'bits:read']
      );

      await this.pubsub.registerUserListener(twitchClient, user).catch(e => debug(e));
    });
  }
}

export default new TwitchPubSub();
