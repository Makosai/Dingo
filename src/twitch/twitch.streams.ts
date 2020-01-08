import { HelixUser } from 'twitch';
import { loadData, updateDB } from '@utils/firebase.utils';
import { LocalError } from '@utils/errors.utils';
import TwitchAuth from './twitch.auth';

interface ITwitchStreamsData {
  users: HelixUser[];
  channels: string[];
}

class TwitchStreams {
  users!: HelixUser[];
  channels!: string[];
  sync: Promise<any>;

  constructor() {
    this.sync = Promise.all([this.loadStreams()]);
  }

  async loadStreams() {
    const users: HelixUser[] = [];
    const channels: string[] = [];

    const data: ITwitchStreamsData = { users, channels };

    const res = await loadData('twitch', 'streams', data);
    this.users = await TwitchAuth.twitchCredentials.helix.users.getUsersByNames(
      res.users.map((user: any) => {
        return user._data.id;
      })
    );

    this.channels = res.channels;
  }

  async addUser(user: HelixUser) {
    this.users.push(user);

    return updateDB('twitch', 'streams', { users: this.users }).catch(err => {
      throw new LocalError(
        'Failed to add a user to the TwitchStreams.\n\n' + user
      );
    });
  }
}

export default new TwitchStreams();
