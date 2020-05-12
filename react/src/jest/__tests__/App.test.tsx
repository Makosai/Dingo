import React from 'react';

import { render } from '@testing-library/react';

import App from '../../App';

import '../../App.scss';

describe('<App />', () => {
  test('Loaded successfully', () => {
    const { getByText } = render(<App />);
    const linkElement = getByText(/learn react/i);
    expect(linkElement).toBeInTheDocument();
  }, 5000);
});
