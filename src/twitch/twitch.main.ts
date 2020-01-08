import TwitchClient from './twitch.client';

class Twitch {
  sync: Promise<any>;

  constructor() {
    this.sync = Promise.all([this.connect()]);
  }

  async connect() {
    require('@twitch/events/events.main'); // Load all events.

    await TwitchClient.client.connect();
  }
}

export default new Twitch();
