import React, { useState } from 'react';
import { apiFetch } from '../../../../utils/global_variables';

export default function Authorize() {
  const botScopes = 'chat:read+chat:edit';
  const userScopes = 'channel_subscriptions+bits:read';

  apiFetch<string>('twitch/id').then((res) => {
    setClientID(res);
  });
  const [clientID, setClientID] = useState('');
  const callbackUri = 'http://dingo.makosai.com:2351/callback'; // Replace with a URL from database @express directory /v1/site/url.
  const baseUrl = `https://id.twitch.tv/oauth2/authorize?response_type=code&client_id=${clientID}&redirect_uri=${callbackUri}&scope=`;
  const botUrl = `${baseUrl}${botScopes}`;
  const userUrl = `${baseUrl}${userScopes}`;

  return (
    <div>
      <h1>Authorization Generation Station</h1>
      {clientID !== '' ? (
        <div>
          <a href={botUrl}>Bot Auth</a>
          <a href={userUrl}>User Auth</a>
        </div>
      ) : (
        'Loading...'
      )}
    </div>
  );
}
