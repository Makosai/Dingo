import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { apiPost } from '../../../../utils/global_variables';

type TwitchCallback = {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  scope: [];
  token_type: string;
};

export default function Callback() {
  const search = useLocation().search;
  const code = new URLSearchParams(search).get('code');
  if (code !== null) {
    apiPost<TwitchCallback>('twitch/authorize', code).then((res) => {
      const {
        access_token,
        refresh_token,
        expires_in,
        scope,
        token_type
      } = res;

      setAuth({
        access_token,
        refresh_token,
        expires_in,
        scope,
        token_type
      });
    });
  }

  const [auth, setAuth] = useState<TwitchCallback>({
    access_token: '...',
    refresh_token: '...',
    expires_in: NaN,
    scope: [],
    token_type: '...'
  });

  return (
    <div>
      <h1>Your Passport, Human.</h1>
      <div>
        <span>Access Token: {auth.access_token}</span>
        <span>Refresh Token: {auth.refresh_token}</span>
        <span>Expires In: {auth.expires_in}</span>
        <span>Scope: {auth.scope}</span>
        <span>Token Type: {auth.token_type}</span>
      </div>
    </div>
  );
}
