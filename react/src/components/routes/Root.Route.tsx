import { IRoute } from './Routes';

import Home from '../pages/Home/Home';
import Funds from '../pages/Funds/Funds';
import Authorize from '../pages/Twitch/Authorize/Authorize';
import Callback from '../pages/Twitch/Authorize/Callback';

// tslint:disable: object-literal-sort-keys

const RootRoutes: IRoute[] = [
  {
    name: 'Home',
    path: '/',
    component: Home
  },
  {
    name: 'Funds',
    path: '/funds/:username',
    component: Funds
  },
  {
    name: 'Authorize',
    path: '/twitch/authorize',
    component: Authorize
  },
  {
    name: 'Home',
    path: '/twitch/callback',
    component: Callback
  }
];

export default RootRoutes;
