import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import arTranslation from './locales/ar.json';
import enTranslation from './locales/en.json';

const savedLang = localStorage.getItem('cybercenter_lang') || 'ar';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      ar: { translation: arTranslation },
      en: { translation: enTranslation },
    },
    lng: savedLang,
    fallbackLng: 'ar',
    interpolation: {
      escapeValue: false,
    },
  });

export const setAppLanguage = (lang: 'ar' | 'en') => {
  i18n.changeLanguage(lang);
  localStorage.setItem('cybercenter_lang', lang);
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
};

// Set initial document direction
document.documentElement.lang = savedLang;
document.documentElement.dir = savedLang === 'ar' ? 'rtl' : 'ltr';

export default i18n;

