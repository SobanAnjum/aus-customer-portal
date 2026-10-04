import { useState } from 'react';
import CustomerApp from './customer/CustomerApp.tsx';
import { Language } from './lib/translations.ts';

export default function App() {
  const [lang, setLang] = useState<Language>('de');

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      <CustomerApp
        lang={lang}
        onChangeLanguage={setLang}
      />
    </div>
  );
}
