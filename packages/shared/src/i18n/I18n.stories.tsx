import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { getTranslations, LOCALES } from './translations';
import type { Locale } from '../utils/constants';

const meta: Meta = {
  title: 'Shared/I18n/Translations',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'getTranslations(locale) returns the full translation object for the given locale.',
      },
    },
  },
};

export default meta;

function TranslationsDemo() {
  const [locale, setLocale] = useState<Locale>('en');
  const t = getTranslations(locale);
  return (
    <div>
      <p>
        <label>
          Locale:{' '}
          <select value={locale} onChange={(e) => setLocale(e.target.value as Locale)}>
            {LOCALES.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </label>
      </p>
      <h4>common</h4>
      <ul>
        <li>save: {t.common.save}</li>
        <li>cancel: {t.common.cancel}</li>
        <li>loading: {t.common.loading}</li>
      </ul>
      <h4>auth</h4>
      <ul>
        <li>login: {t.auth.login}</li>
        <li>email: {t.auth.email}</li>
        <li>password: {t.auth.password}</li>
      </ul>
      <h4>roles</h4>
      <ul>
        <li>admin: {t.roles.admin}</li>
        <li>trainer: {t.roles.trainer}</li>
        <li>customer: {t.roles.customer}</li>
      </ul>
    </div>
  );
}

export const Default: StoryObj = {
  render: () => <TranslationsDemo />,
};
