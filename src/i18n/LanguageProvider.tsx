'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { defaultLang, dictionaries as staticDictionaries, isLang, type Dict, type Lang } from './dictionaries';

const STORAGE_KEY = 'petebird.lang';

export type ContactInfo = { lineUrl: string | null; facebookUrl: string | null; phone: string | null; lineQrImage: string | null };
const emptyContact: ContactInfo = { lineUrl: null, facebookUrl: null, phone: null, lineQrImage: null };

type LanguageValue = { lang: Lang; t: Dict; setLang: (next: Lang) => void; contact: ContactInfo };
const LanguageContext = createContext<LanguageValue>({ lang: defaultLang, t: staticDictionaries[defaultLang], setLang: () => {}, contact: emptyContact });

type Props = {
  children: React.ReactNode;
  /** Dictionaries to use, e.g. merged with content fetched from MongoDB. Defaults to the static built-in copy. */
  dictionaries?: Record<Lang, Dict>;
  /** Contact details (LINE/Facebook/phone/QR), typically fetched from MongoDB by the server component. */
  contact?: ContactInfo;
};

export function LanguageProvider({ children, dictionaries, contact = emptyContact }: Props) {
  const dicts = dictionaries ?? staticDictionaries;
  const [lang, setLangState] = useState<Lang>(defaultLang);

  // Resolve the stored or browser language after hydration so the server markup stays stable.
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (isLang(stored)) return setLangState(stored);
    const browser = navigator.languages.find(code => isLang(code.slice(0, 2).toLowerCase()));
    if (browser) setLangState(browser.slice(0, 2).toLowerCase() as Lang);
  }, []);

  useEffect(() => { document.documentElement.lang = dicts[lang].htmlLang; }, [lang, dicts]);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    try { localStorage.setItem(STORAGE_KEY, next); } catch { /* storage unavailable (private mode) */ }
  }, []);

  return <LanguageContext.Provider value={{ lang, t: dicts[lang], setLang, contact }}>{children}</LanguageContext.Provider>;
}

export const useLanguage = () => useContext(LanguageContext);
