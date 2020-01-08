import { client } from './discord.config';
import { loadCredentials, ICredentials } from '@utils/firebase.utils';

interface IDiscordCredentials extends ICredentials {}

class DiscordAuth {
  credentials!: IDiscordCredentials;

  constructor() {
    this.loadCredentials();
  }

  async loadCredentials() {
    this.credentials = await loadCredentials('discord');

    client.login(this.credentials.token);
  }
}

export default new DiscordAuth();
