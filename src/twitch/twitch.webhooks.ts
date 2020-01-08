import Webhooks from 'twitch-webhooks';
import twitchAuth from './twitch.auth';

class TwitchWebHooks {
  webhook!: Webhooks;

  constructor() {
    this.loadWebhook();
  }

  private async loadWebhook() {
    return await Webhooks.create(twitchAuth.twitchCredentials, { port: 2241 });
  }
}

export default new TwitchWebHooks();
