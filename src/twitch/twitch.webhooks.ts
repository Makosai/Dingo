import Webhooks, { StreamChangeSubscription } from 'twitch-webhooks';
import TwitchAuth from './twitch.auth';

class TwitchWebHooks {
  webhook!: Webhooks;
  subscriptions: Map<string, StreamChangeSubscription> = new Map<string, StreamChangeSubscription>();
  sync: Promise<any>;

  constructor() {
    this.sync = Promise.all([this.loadWebhook()]);
  }

  private async loadWebhook() {
    this.webhook = await Webhooks.create(TwitchAuth.twitchCredentials, { port: 2241 });
    this.webhook.listen();
  }
}

export default new TwitchWebHooks();
