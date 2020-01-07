import TwitchWebhook from './webhook/webhook.main';
import TwitchAuth from './twitch.auth';
import { ConfigError } from '@utils/errors.utils';

class Twitch {
  webhook: TwitchWebhook;

  constructor() {
    if (TwitchAuth.credentials === undefined) {
      throw new ConfigError(
        'Failed to create Webhook. Twitch credentials not loaded yet.'
      ); // This is a logical error that may occur with improper orders.
    }

    this.webhook = new TwitchWebhook({
      client_id: TwitchAuth.credentials.clientID,
      callback: '127.0.0.1'
    });
  }

  /**
   * Subscribe to a stream
   * @param user
   * @param callback
   */
  async subStream(user_id: number, callback?: Function) {
    await this.webhook.subscribe('https://api.twitch.tv/helix/streams', {
      user_id
    });

    if (callback) callback();
  }
}

export default new Twitch();
