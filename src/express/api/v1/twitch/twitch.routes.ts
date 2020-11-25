import { handleApiError } from '../v1.utils';

import express from 'express';

import api from '../../api.main';
import { twitch } from '../v1.main'; // API endpoint
import TwitchAuth from '@twitch/twitch.auth';
import fetch from 'node-fetch';

export const router = express.Router();
api.use(twitch, router);

// Create a new template entry.
router.get('/id', async (req, res) => {
  try {
    res.json(TwitchAuth.credentials.clientID);
  } catch (error) {
    handleApiError(res, error);
  }
});

router.post('/callback', async (req, res) => {
  try {
    console.log('test', req.body);

    res.json({ body: req.body });
  } catch (error) {
    handleApiError(res, error);
  }
});

router.post('/authorize', async (req, res) => {
  try {
    const { clientID, clientSecret } = TwitchAuth.credentials;
    if (req.body === undefined) {
      res.status(422).json('Missing auth code.');
      return;
    }

    const { code } = req.body;

    const params = new URLSearchParams();
    params.append('client_id', clientID);
    params.append('client_secret', clientSecret);
    params.append('code', code);
    params.append('grant_type', 'authorization_code');
    params.append(
      'redirect_uri',
      'http://dingo.makosai.com:2351/api/v1/twitch/callback'
    ); // TODO: Change to something that can be edited via the database.

    await fetch(`https://id.twitch.tv/oauth2/token`, {
      method: 'POST',
      body: params
    })
      .then(async (auth) => {
        const authJson = await auth.json();

        if (!auth.ok) {
          throw new Error(JSON.stringify(authJson));
        }

        res.json(authJson);
      })
      .catch((err) => {
        throw err;
      });
  } catch (error) {
    handleApiError(res, error);
  }
});

export default {};
