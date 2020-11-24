import React, { useState } from 'react';
import { apiFetch } from '../../../../utils/global_variables';

export default function Authorize() {
  const botScopes = 'chat:read+chat:edit';
  const userScopes = 'channel_subscriptions+bits:read';

  apiFetch<string>('twitch/id').then((res) => {
    setClientID(res);
  });
  const [clientID, setClientID] = useState('');
  const baseUrl = `https://id.twitch.tv/oauth2/authorize?response_type=code&client_id=${clientID}&redirect_uri=http://dingo.makosai.com/callback&scope=`; // Replace with a URL from database @express directory /v1/site/url.
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
