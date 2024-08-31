import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import RNLanguageDetector from '@os-team/i18next-react-native-language-detector';
import 'intl-pluralrules';
import enTranslation from './locales/en/translation.json';
import trTranslation from './locales/tr/translation.json';

i18n
    .use(RNLanguageDetector)
    .use(initReactI18next)
    .init({
        resources: {
            en: {
                translation: enTranslation,
            },
            tr: {
                translation: trTranslation,
            }
        },
        supportedLngs: ["en", "tr"],
        fallbackLng: "en",
        //interpolation: {
        //    escapeValue: false,
        //},
    });

export default i18n;