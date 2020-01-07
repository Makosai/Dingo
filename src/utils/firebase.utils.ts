import { db } from '@firebase/firebase.main';
import { LocalError } from './essentials.utils';

export interface ICredentials {
  token: string;
  clientID: string;
  clientSecret: string;
}

export async function loadCredentials(collection: string, id = 'credentials') {
  const doc = await db
    .collection(collection)
    .doc(id)
    .get();

  let credentials: ICredentials = {
    token: '',
    clientID: '',
    clientSecret: ''
  };

  if (doc.exists) {
    credentials = doc.data() as ICredentials;

    const credentialsSet = Object.values(credentials).every(item => {
      if (item === '') {
        return false;
      }
      return true;
    });

    if (!credentialsSet) {
      throw new Error(
        LocalError(
          `Please set up your credentials in /${collection}/${id}. A document has been created for you.`
        )
      );
    }
  } else {
    const placeholder: ICredentials = credentials;
    db.collection(collection)
      .doc(id)
      .create(placeholder);

    throw new Error(
      LocalError(
        `Please set up your credentials in /${collection}/${id}. A document has been created for you.`
      )
    );
  }

  return credentials;
}
