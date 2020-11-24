import React from 'react';
import { apiFetch } from '../../../../utils/global_variables';

export default function Authorize() {
  const botScopes = 'chat:read+chat:edit';
  const userScopes = 'channel_subscriptions+bits:read';
  const clientID = apiFetch('twitch/id');
  const botUrl = '';
  const userUrl = '';

  return (
    <div>
      <h1>Authorization Generation Station</h1>
      <div>
        <a href={botUrl}>Bot Auth</a>
        <a href={userUrl}>User Auth</a>
      </div>
    </div>
  );
}
