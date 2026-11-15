
import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { Alert } from 'react-native';
import App from '../App';

describe('Login Screen Accessibility', () => {
  test('native sign in keeps the alert behaviour without browser APIs', async () => {
    const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    try {
      const { getByRole } = await render(<App />);
      await fireEvent.press(getByRole('button', { name: 'Sign in' }));
      expect(alert).toHaveBeenCalledWith('Sign in pressed');
    } finally {
      alert.mockRestore();
    }
  });
 test('screen has an accessible heading', async () => {
  const { getByRole } = await render(<App />);

    expect(
      getByRole('header', {
        name: 'Accessibility Testing PoC',
      })
    ).toBeTruthy();
  });

  test('email input has accessibility label', async () => {
    const { getByLabelText } = await render(<App />);

    expect(getByLabelText('Email address')).toBeTruthy();
  });

  test('password input has accessibility label', async () => {
    const { getByLabelText } = await render(<App />);

    expect(getByLabelText('Password')).toBeTruthy();
  });

  test('sign in button has accessible role and name', async () => {
    const { getByRole } = await render(<App />);

    expect(
      getByRole('button', {
        name: 'Sign in',
      })
    ).toBeEnabled();
  });

  test('sign in button has accessibility hint', async () => {
    const { getByRole } = await render(<App />);

    const button = getByRole('button', {
      name: 'Sign in',
    });

    expect(button.props.accessibilityHint).toBe(
      'Signs in to your account'
    );
  });
});
