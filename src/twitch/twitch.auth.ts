import { loadCredentials, ICredentials } from '@utils/firebase.utils';
import { db } from '@firebase/firebase.main';
import { ConfigError } from '@utils/errors.utils';

interface ITwitchCredentials extends ICredentials {
  callback: string;
}

class TwitchAuth {
  credentials: ITwitchCredentials | undefined;

  constructor() {
    this.loadCredentials();
  }

  async loadCredentials() {
    this.credentials = {
      ...(await loadCredentials('twitch')),
      ...(await this.loadConfig())
    };
  }

  async loadConfig() {
    const collection = 'twitch';
    const id = 'config';

    const doc = await db
      .collection(collection)
      .doc(id)
      .get();

    let config = {
      callback: ''
    };

    if (doc.exists) {
      config = doc.data() as { callback: string };

      const configSet = Object.values(config).every(item => {
        if (item === '') {
          return false;
        }
        return true;
      });

      if (!configSet) {
        throw new ConfigError(
          `Please set up your config in /${collection}/${id}. A document has been created for you.`
        );
      }
    } else {
      db.collection(collection)
        .doc(id)
        .create(config);

      throw new ConfigError(
        `Please set up your config in /${collection}/${id}. A document has been created for you.`
      );
    }

    return config;
  }
}

export default new TwitchAuth();
