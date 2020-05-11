import PubSubClient, { PubSubListener } from 'twitch-pubsub-client';
import TwitchAuth from './twitch.auth';

interface IPubSubTypes {
  subscription: PubSubListener;
  bits: PubSubListener;
}

class TwitchWebHooks {
  pubsub: PubSubClient;
  subscriptions: Map<string, IPubSubTypes> = new Map<string, IPubSubTypes>();
  sync: Promise<any>;

  constructor() {
    this.sync = Promise.all([this.loadPubSub()]);
  }

  private async loadPubSub() {
    this.pubsub = new PubSubClient();
    await this.pubsub.registerUserListener(TwitchAuth.twitchCredentials);
  }
}

export default new TwitchWebHooks();
