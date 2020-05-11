import { IRoute } from './Routes';

import Home from '../pages/Home/Home';
import Funds from '../pages/Funds/Funds';

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
  }
];

export default RootRoutes;
