import { SimpleAdapter, Subscription, WebHookListener as Webhooks } from 'twitch-webhooks';
import TwitchAuth from './twitch.auth';

class TwitchWebHooks {
  webhook!: Webhooks;
  subscriptions: Map<string, Subscription> = new Map<
    string,
    Subscription
  >();
  sync: Promise<any>;

  constructor() {
    this.sync = Promise.all([this.loadWebhook()]);
  }

  private async loadWebhook() {
    this.webhook = new Webhooks(
      TwitchAuth.twitchCredentials,
      new SimpleAdapter({
        hostName: 'dingo.makosai.com',
        listenerPort: 2241,
      })
    );
    await this.webhook.listen();
  }
}

export default new TwitchWebHooks();
