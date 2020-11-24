import { db } from '@firebase/firebase.main';
import { InitError } from './errors.utils';
import { debug } from './essentials.utils';

export interface ICredentials {
  token: string;
  refreshToken: string;
  clientID: string;
  clientSecret: string;
}

export async function loadData(collection: string, id: string, data: any) {
  const doc = await db.collection(collection).doc(id).get();

  if (doc.exists) {
    // tslint:disable-next-line: no-parameter-reassignment
    data = doc.data() as typeof data;

    const dataSet = Object.values(data).every((item) => {
      if (item === '') {
        return false;
      }
      return true;
    });

    if (!dataSet) {
      throw new InitError(
        `Please set up your ${id} in /${collection}/${id}. A document has been created for you.`
      );
    }
  } else {
    db.collection(collection)
      .doc(id)
      .create(data)
      .catch((err) => {
        debug('warning (futils create): missing data.');
      });

    throw new InitError(
      `Please set up your ${id} in /${collection}/${id}. A document has been created for you.`
    );
  }

  return data;
}

export async function loadCredentials(collection: string, id = 'credentials') {
  const doc = await db.collection(collection).doc(id).get();

  let credentials: ICredentials = {
    token: '',
    refreshToken: '',
    clientID: '',
    clientSecret: ''
  };

  if (doc.exists) {
    credentials = doc.data() as ICredentials;

    const credentialsSet = Object.values(credentials).every((item) => {
      if (item === '') {
        return false;
      }
      return true;
    });

    if (!credentialsSet) {
      throw new InitError(
        `Please set up your credentials in /${collection}/${id}. A document has been created for you.`
      );
    }
  } else {
    const placeholder: ICredentials = credentials;
    db.collection(collection)
      .doc(id)
      .create(placeholder)
      .catch((err) => {
        debug('warning (futils create2): missing credentials.');
      });

    throw new InitError(
      `Please set up your credentials in /${collection}/${id}. A document has been created for you.`
    );
  }

  return credentials;
}

export async function updateDB(collection: string, id: string, data: any) {
  db.collection(collection)
    .doc(id)
    .update(JSON.parse(JSON.stringify(data)))
    .catch((err) => {
      debug('warning (futils update1): error updating data.');
    });
}
