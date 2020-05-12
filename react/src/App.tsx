import React from 'react';

import { Switch, BrowserRouter } from 'react-router-dom';
import RootRoutes from './components/routes/Root.Route';
import Routes from './components/routes/Routes';

function App() {
  return (
    <BrowserRouter>
      <Switch>
        <Routes routes={RootRoutes} />
      </Switch>
    </BrowserRouter>
  );
}

export default App;
