import { ChatClient } from 'twitch-chat-client';
import TwitchAuth from './twitch.auth';

class TwitchClient {
  client!: ChatClient;

  sync: Promise<any>;

  constructor() {
    this.sync = Promise.all([this.loadClient()]);
  }

  private async loadClient() {
    this.client = new ChatClient(
      TwitchAuth.twitchCredentials
    );
  }
}

export default new TwitchClient();
