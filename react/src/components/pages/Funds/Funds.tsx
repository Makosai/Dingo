import React, { useState, useEffect } from 'react';

// scss imports
import './scss/makosai.funds.scss';
import './scss/tireddadgames.funds.scss';
import { apiFetch } from '@components/../utils/global_variables';

export default function Funds(props: any) {
  const username = props.match.params.username;

  const [funds, setFunds] = useState(0);

  apiFetch<number>(`funds/${username}`).then((funds) => {
    setFunds(funds);
  }).catch(e => {
    console.log(e);
  });

  useEffect(() => {
    const timer = setInterval(() => {
      apiFetch<number>(`funds/${username}`).then((funds) => {
        setFunds(funds);
      }).catch(e => {
        console.log(e);
      });
    }, 10000);

    return () => clearInterval(timer);
  }, []);

  return <div id={username}>{`We have currently raised $${funds}`}</div>;
}
