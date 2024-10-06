import RNLanguageDetector from '@os-team/i18next-react-native-language-detector';
import { LanguageDetectorModule } from 'i18next';
import { ToplasPreferences } from './storage';

const ToplasLanguageModule: LanguageDetectorModule = {
    type: 'languageDetector',
    init: () => {},
    detect: () => {
        const lang = ToplasPreferences.getLanguage();
        if (lang == "system") {
            return RNLanguageDetector.detect();
        } else {
            return lang;
        }
    },
    cacheUserLanguage: () => {},
};

export default ToplasLanguageModule;