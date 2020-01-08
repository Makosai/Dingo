import { loadData } from '@utils/firebase.utils';

interface ITwitchSettings {
  channels: []
}

class TwitchAuth {
  settings!: ITwitchSettings;

  constructor() {
    this.loadSettings();
  }

  async loadSettings() {
    const data: ITwitchSettings = { channels: [] };
    this.settings = await loadData('twitch', 'settings', data);
  }
}

export default new TwitchAuth();
