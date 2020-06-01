import React, { useState, useEffect } from 'react';

// scss imports
import './scss/funds.scss';
import { apiFetch } from '@components/../utils/global_variables';

export default function Funds(props: any) {
  const username = props.match.params.username;

  const searchParams = new URLSearchParams(props.location.search);

  const name = searchParams.get('name');
  const goal = searchParams.get('goal');
  let scroll = searchParams.get('scroll');

  if(scroll !== null && !['left', 'right', 'custom'].includes(scroll)) {
    console.log(scroll);
    scroll = null;
  }

  const [funds, setFunds] = useState(0);

  apiFetch<number>(`funds/${username}`)
    .then((funds) => {
      setFunds(funds / 100);
    })
    .catch((e) => {
      console.log(e);
    });

  useEffect(() => {
    const timer = setInterval(() => {
      apiFetch<number>(`funds/${username}`)
        .then((funds) => {
          setFunds(funds / 100);
        })
        .catch((e) => {
          console.log(e);
        });
    }, 10000);

    return () => clearInterval(timer);
  }, [username]);

  function getName() {
    if(name !== null) {
      return <span className="text">{`${name}: `}</span>;
    }
    
    return `We have currently raised `;
  }

  function getFunds() {
    const formattedFunds = Number(funds).toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
    });

    if(goal !==  null) {
      const formattedGoal = Number(goal).toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
      });

      return `(${formattedFunds}/${formattedGoal})`;
    }

    return formattedFunds;
  }

  function getScroll(funds: JSX.Element) {
    if(scroll !== null) {
      return <span className={`scroll ${scroll}`}>{funds}</span>
    }

    return funds;
  }

  return (
    <div id={username} className="funding">
      {getScroll(<>{getName()}{getFunds()}</>)}
    </div>
  );
}
