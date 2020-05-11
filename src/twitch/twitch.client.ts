import ChatClient from 'twitch-chat-client';
import PubSubClient from 'twitch-pubsub-client';
import TwitchAuth from './twitch.auth';

class TwitchClient {
  client!: ChatClient;
  pubsub!: PubSubClient;

  sync: Promise<any>;

  constructor() {
    this.sync = Promise.all([this.loadClient()]);
  }

  private async loadClient() {
    this.client = await ChatClient.forTwitchClient(
      TwitchAuth.twitchCredentials
    );

    this.pubsub = new PubSubClient();
    await this.pubsub.registerUserListener(TwitchAuth.twitchCredentials);
  }
}

export default new TwitchClient();
