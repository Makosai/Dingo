// Firebase and Express imports
import path from 'path';
import express from 'express';
import bodyParser from 'body-parser';
import http from 'http';

// API initialization
import config from './api/api.config';
import api from './api/api.main';

// Utilities
import { debug } from '@utils/essentials.utils';

const main = express(); // The glue that puts it all together!

// Load the react web pages first.
main.use(express.static(path.join(process.cwd(), 'react/build')));

// Latest API Version
main.get('/api/v', (req, res) => {
  res.json({ api: config.root });
});

// Set the rules and location for the root entrypoint
main.use(config.root, api);
main.use(bodyParser.json());

main.get('/*', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'react/build/index.html'));
});

main.set('port', process.env.PORT || 2351);

http.createServer(main).listen(main.get('port'), () => {
  debug(`Express is listening on port ${main.get('port')}`, true);
});

export default main;
