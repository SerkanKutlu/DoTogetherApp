import i18n from 'i18next';
import {initReactI18next} from 'react-i18next';
import en from './en.json';
import tr from './tr.json';

i18n.use(initReactI18next).init({
  lng: 'en',
  compatibilityJSON: 'v3',
  fallbackLng: 'en',
  resources: {
    en: en,
    tr: tr,
  },
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
