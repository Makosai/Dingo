import { loadData } from '@utils/firebase.utils';

interface ITwitchData {
  channels: string[];
}

class TwitchData {
  data!: ITwitchData;
  sync: Promise<any>;

  constructor() {
    this.sync = Promise.all([this.loadTwitchData()]);
  }

  private async loadTwitchData() {
    this.data = await loadData('twitch', 'data', {
      channels: []
    });
  }
}

export default new TwitchData();
