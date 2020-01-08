import { db } from '@firebase/firebase.main';
import { LocalError } from './essentials.utils';
import { InitError } from './errors.utils';

export interface ICredentials {
  token: string;
  clientID: string;
  clientSecret: string;
}

export async function loadData(collection: string, id: string, data: any) {
  const doc = await db
    .collection(collection)
    .doc(id)
    .get();

  if (doc.exists) {
    data = doc.data() as typeof data;

    const dataSet = Object.values(data).every(item => {
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
      .create(data);

    throw new InitError(
      `Please set up your ${id} in /${collection}/${id}. A document has been created for you.`
    );
  }

  return data;
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
