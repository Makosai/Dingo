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

router.post('/authorize', async (req, res) => {
  try {
    TwitchAuth.credentials.clientID;
  } catch (error) {
    handleApiError(res, error);
  }
});

export default {};
