import { loadData } from '@utils/firebase.utils';
import { HelixUser } from 'twitch';
import { db } from '@firebase/firebase.main';
import { LocalError } from '@utils/errors.utils';

interface ITwitchStreamsData {
  users: HelixUser[];
  channels: string[];
}

class TwitchStreams {
  users!: HelixUser[];
  channels!: string[];

  constructor() {
    this.loadStreams();
  }

  async loadStreams() {
    const users: HelixUser[] = [];
    const channels: string[] = [];

    const data: ITwitchStreamsData = { users, channels };

    const res = await loadData('twitch', 'streams', data);
    this.users = res.streams;
    this.channels = res.channels;
  }

  async addUser(user: HelixUser) {
    this.users.push(user);

    return db
      .collection('twitch')
      .doc('streams')
      .update({ users: this.users })
      .catch(err => {
        throw new LocalError(
          'Failed to add a user to the TwitchStreams.\n\n' + user
        );
      });
  }
}

export default new TwitchStreams();
