import { client } from './discord.config';
import { db } from '@firebase/firebase.main';
import { LocalError } from '@utils/essentials.utils';

interface ICredentials {
  token: string;
  clientID: string;
  clientSecret: string;
}

class DiscordAuth {
  credentials: ICredentials | undefined;

  constructor() {
    this.loadCredentials();
  }

  async loadCredentials() {
    const doc = await db.doc('/discord/credentials').get();
  
    if (doc.exists) {
      this.credentials = doc.data() as ICredentials;
  
      const credentialsSet = Object.values(this.credentials).every(item => {
          if (item === '') {
            return false;
          }
          return true;
        });
  
      if (!credentialsSet) {
        throw new Error(
          LocalError(
            'Please set up your credentials in firestore at /discord/credentials. A document has been created for you.'
          )
        );
      }
    } else {
      const placeholder: ICredentials = {
        token: '',
        clientID: '',
        clientSecret: ''
      };
      db.collection('discord')
        .doc('credentials')
        .create(placeholder);
  
      throw new Error(
        LocalError(
          'Please set up your credentials in firestore at /discord/credentials. A document has been created for you.'
        )
      );
    }
  
    client.login(this.credentials.token);
  }
}

export default new DiscordAuth();
