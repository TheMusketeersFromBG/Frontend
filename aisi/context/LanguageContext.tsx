import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import translations, { type Lang, type T } from '../translations';

const KEY = 'aisi_language';

export const LOCALE_MAP: Record<Lang, string> = {
  BG: 'bg-BG', EN: 'en-US', EL: 'el-GR', ZH: 'zh-CN',
  JP: 'ja-JP', KO: 'ko-KR', DE: 'de-DE', RU: 'ru-RU', FR: 'fr-FR',
  ES: 'es-ES', IT: 'it-IT', PT: 'pt-PT',
};

interface LanguageContextType {
  lang: Lang;
  locale: string;
  setLang: (l: Lang) => void;
  t: T;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'BG',
  locale: 'bg-BG',
  setLang: () => {},
  t: translations.BG,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('BG');

  useEffect(() => {
    AsyncStorage.getItem(KEY).then(v => { if (v) setLangState(v as Lang); });
  }, []);

  const setLang = async (l: Lang) => {
    setLangState(l);
    await AsyncStorage.setItem(KEY, l);
  };

  return (
    <LanguageContext.Provider value={{ lang, locale: LOCALE_MAP[lang] ?? 'en-US', setLang, t: translations[lang] ?? translations.BG }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
