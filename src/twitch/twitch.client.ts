import ChatClient from 'twitch-chat-client';
import TwitchAuth from './twitch.auth';

class TwitchClient {
  client!: ChatClient;

  constructor() {
    this.loadClient();
  }

  private async loadClient() {
    this.client = await ChatClient.forTwitchClient(
      TwitchAuth.twitchCredentials
    );

    require('@twitch/events/events.main'); // Load all events.

    await this.client.connect();
  }
}

export default new TwitchClient();
