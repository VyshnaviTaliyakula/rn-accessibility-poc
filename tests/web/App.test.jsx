import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import App from '../../App';

test('sign-in screen has no detected axe violations', async () => {
  const { container } = render(<App />);

  const results = await axe(container, {
    runOnly: {
      type: 'tag',
      values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'],
    },
    rules: {
        'color-contrast': { enabled: false },
    },
  });

  expect(results).toHaveNoViolations();
});

test('heading and form controls have accessible names', () => {
  render(<App />);

  expect(
    screen.getByRole('heading', {
      name: 'Accessibility Testing PoC',
    }),
  ).toBeInTheDocument();

  expect(screen.getByLabelText('Email address')).toBeInTheDocument();
  expect(screen.getByLabelText('Password')).toBeInTheDocument();

  expect(
    screen.getByRole('button', { name: 'Sign in' }),
  ).toBeEnabled();
});

test('keyboard users can reach and complete the fields', async () => {
  const user = userEvent.setup();
  render(<App />);

  const email = screen.getByLabelText('Email address');
  const password = screen.getByLabelText('Password');
  const submit = screen.getByRole('button', { name: 'Sign in' });

  await user.tab();
  expect(email).toHaveFocus();
  expect(email).toHaveAttribute('aria-invalid', 'false');
  await user.type(email, 'person@example.com');

  await user.tab();
  expect(password).toHaveFocus();
  expect(password).toHaveAttribute('aria-invalid', 'false');
  await user.type(password, 'example-password');

  await user.tab();
  expect(submit).toHaveFocus();

  expect(email).toHaveValue('person@example.com');
  expect(password).toHaveValue('example-password');
});

test('Enter submits the form and exposes the demo result as a status', async () => {
  const user = userEvent.setup();
  render(<App />);
  expect(screen.getByRole('main')).toBeInTheDocument();
  expect(screen.getByLabelText('Email address')).toBeRequired();
  expect(screen.getByLabelText('Password')).toBeRequired();

  await user.type(screen.getByLabelText('Email address'), 'person@example.com');
  await user.type(screen.getByLabelText('Password'), 'example-password{Enter}');

  expect(screen.getByRole('status')).toHaveTextContent(
    'Sign in pressed. This demo does not authenticate accounts.',
  );
});

test('invalid input is explained and focus moves to the field needing correction', async () => {
  const user = userEvent.setup();
  render(<App />);
  const email = screen.getByLabelText('Email address');
  const password = screen.getByLabelText('Password');
  await user.click(screen.getByRole('button', { name: 'Sign in' }));
  expect(email).toHaveFocus();
  expect(email).toHaveAccessibleDescription('Enter a valid email address.');
  expect(email).toHaveAttribute('aria-invalid', 'true');
  expect(screen.getByRole('status')).toBeEmptyDOMElement();
  await user.type(email, 'person@example.com');
  await user.click(screen.getByRole('button', { name: 'Sign in' }));
  expect(password).toHaveFocus();
  expect(password).toHaveAccessibleDescription('Enter your password.');
  expect(password).toHaveAttribute('aria-invalid', 'true');
});
