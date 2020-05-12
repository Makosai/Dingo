import React from 'react';

import { Switch } from 'react-router-dom';
import RootRoutes from './components/routes/Root.Route';
import Routes from './components/routes/Routes';

function App() {
  return (
    <Switch>
      <Routes routes={RootRoutes} />
    </Switch>
  );
}

export default App;
