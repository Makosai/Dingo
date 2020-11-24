import { handleApiError } from '../v1.utils';

import express from 'express';

import api from '../../api.main';
import { twitch } from '../v1.main'; // API endpoint
import TwitchAuth from '@twitch/twitch.auth';

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
    console.log('body2', req.body);

    res.json({ body: req.body });
  } catch (error) {
    handleApiError(res, error);
  }
});

router.post('/authorize', async (req, res) => {
  try {
    const { clientID, clientSecret } = TwitchAuth.credentials;
    const { code } = req.body;
    console.log('body', req.body);

    const params = new URLSearchParams();
    params.append('client_id', clientID);
    params.append('client_secret', clientSecret);
    params.append('code', code);
    params.append('grant_type', 'authorization_code');
    params.append(
      'redirect_uri',
      'http://dingo.makosai.com/api/v1/twitch/callback'
    ); // TODO: Change to something that can be edited via the database.

    fetch('https://id.twitch.tv/oauth2/token', {
      method: 'POST',
      body: params
    })
      .then((auth) => {
        if (!auth.ok) {
          throw new Error(auth.statusText);
        }
        return auth.json();
      })
      .catch((err) => {
        console.log(err);
      });
  } catch (error) {
    handleApiError(res, error);
  }
});

export default {};
