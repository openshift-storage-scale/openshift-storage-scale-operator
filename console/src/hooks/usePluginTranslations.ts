import { type TOptions } from 'i18next';
import { getI18n, useTranslation } from 'react-i18next';

export const usePluginTranslations = () =>
  useTranslation('plugin__openshift-fusion-access-console');

/**
 * Translates text within the plugin namespace
 * Use this function when translating text outside a React component.
 * @param value Text to translate
 * @param options Translation options
 * @see https://www.i18next.com/overview/api#t
 */
export const t = (value: string, options?: TOptions) =>
  getI18n().t(value, { ns: 'plugin__openshift-fusion-access-console', ...options });
