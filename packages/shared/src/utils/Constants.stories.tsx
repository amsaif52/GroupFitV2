import type { Meta, StoryObj } from '@storybook/react';
import { ROLES, API_PREFIXES, LOCALES, DEFAULT_LOCALE, APP_NAMES } from './constants';

const meta: Meta = {
  title: 'Shared/Utils/Constants',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Platform constants: roles, API prefixes, locales, app names.',
      },
    },
  },
};

export default meta;

export const Roles: StoryObj = {
  render: () => (
    <div>
      <h3>ROLES</h3>
      <ul>
        <li>
          <code>ADMIN</code>: {ROLES.ADMIN}
        </li>
        <li>
          <code>TRAINER</code>: {ROLES.TRAINER}
        </li>
        <li>
          <code>CUSTOMER</code>: {ROLES.CUSTOMER}
        </li>
      </ul>
    </div>
  ),
};

export const ApiPrefixes: StoryObj = {
  render: () => (
    <div>
      <h3>API_PREFIXES</h3>
      <ul>
        <li>
          <code>CUSTOMER</code>: {API_PREFIXES.CUSTOMER}
        </li>
        <li>
          <code>TRAINER</code>: {API_PREFIXES.TRAINER}
        </li>
        <li>
          <code>ADMIN</code>: {API_PREFIXES.ADMIN}
        </li>
      </ul>
    </div>
  ),
};

export const Locales: StoryObj = {
  render: () => (
    <div>
      <h3>LOCALES</h3>
      <p>Supported: {LOCALES.join(', ')}</p>
      <p>
        Default: <code>{DEFAULT_LOCALE}</code>
      </p>
    </div>
  ),
};

export const AppNames: StoryObj = {
  render: () => (
    <div>
      <h3>APP_NAMES</h3>
      <ul>
        <li>
          <code>WEB</code>: {APP_NAMES.WEB}
        </li>
        <li>
          <code>CUSTOMER_APP</code>: {APP_NAMES.CUSTOMER_APP}
        </li>
        <li>
          <code>TRAINER_APP</code>: {APP_NAMES.TRAINER_APP}
        </li>
      </ul>
    </div>
  ),
};
