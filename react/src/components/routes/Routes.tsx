import React from 'react';
import { Route } from 'react-router-dom';

export default function Routes({ routes }: IRoutes) {
  const defaults = {
    hideNav: false
  }

  function reduceRoutes(
    routes: IRoute[],
    prevName = '',
    prevPath = '',
    prevRole?: true | string[]
  ): IRoute[] {
    return routes.reduce((prev, curr) => {
      const next = curr;

      next.name = prevName + next.name;
      next.path = prevPath + next.path;

      if(next.roles === true) {
        next.roles = prevRole;
      }

      // Set defaults.
      if(next.hideNav === undefined) {
        next.hideNav = defaults.hideNav;
      }

      // Loop children.
      let child;
      if(next.children !== undefined && next.children.length > 0) {
        child = reduceRoutes(next.children, next.name, next.path, next.roles);
      }

      // Cleanup the children since we're done with it.
      delete next.children;

      let final;
      if(child !== undefined) {
        final = [...prev, next, ...child];
      } else {
        final = [...prev, next];
      }

      return final;
    }, [] as IRoute[]);
  }

  const reducedRoutes = reduceRoutes(routes).map((route: IRoute) => {
    if (route.path !== null) {
      return (
        <Route key={route.name} exact path={route.path} component={route.component} />
      );
    }

    return (<Route key={route.name} component={route.component} />); // 404 Not Found.
  })

  return <>{reducedRoutes}</>;
}

interface IRoutes {
  routes: IRoute[];
}

export interface IRoute {
  name: string;
  path: string | null;
  component: any;
  hideNav?: boolean;
  roles?: true | string[];
  children?: IRoute[];
}
