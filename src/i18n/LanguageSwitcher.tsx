'use client';

import { DropdownMenu } from 'radix-ui';
import { ChevronDown } from 'lucide-react';
import { languages } from './dictionaries';
import { useLanguage } from './LanguageProvider';

export function LanguageSwitcher({ className = '' }: { className?: string }) {
  const { lang, t, setLang } = useLanguage();
  const current = languages.find(l => l.code === lang) ?? languages[0];

  return <DropdownMenu.Root>
    <DropdownMenu.Trigger className={`lang-switcher ${className}`} aria-label={t.switcherLabel}>
      <span className={`fi fi-${current.flag}`} aria-hidden="true"/>
      <span className="lang-switcher-code">{current.short}</span>
      <ChevronDown size={14} strokeWidth={2}/>
    </DropdownMenu.Trigger>
    <DropdownMenu.Portal>
      <DropdownMenu.Content className="lang-dropdown" align="end" sideOffset={10}>
        {languages.map(({ code, short, label, flag }) => <DropdownMenu.Item key={code} lang={code} className={`lang-option ${lang === code ? 'is-active' : ''}`} onSelect={() => setLang(code)}>
          <span className={`fi fi-${flag}`} aria-hidden="true"/>
          <span className="lang-option-label">{label}</span>
          <span className="lang-option-code">{short}</span>
        </DropdownMenu.Item>)}
      </DropdownMenu.Content>
    </DropdownMenu.Portal>
  </DropdownMenu.Root>;
}
