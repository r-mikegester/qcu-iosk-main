import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { I18nextProvider } from "react-i18next";
import i18next from "i18next";
import translationEN from "./components/locales/english_translation.json";
import translationTG from "./components/locales/tagalog_translation.json";
// import translationSP from "./components/locales/spain_translation.json";
// import translationKR from "./components/locales/korea_translation.json";
// import translationJPN from "./components/locales/japan_translation.json";
// import translationGMY from "./components/locales/germany_translation.json";
// import translationTHAI from "./components/locales/thailand_translation.json";
// import translationVN from "./components/locales/vietnam_translation.json";
// import translationFR from "./components/locales/france_translation.json";
// import translationCMD from "./components/locales/cambodia_translation.json";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { Analytics } from "@vercel/analytics/react"
const container = document.getElementById('root');
const root = createRoot(container!);
const resources = {
  en: {
    translation: translationEN,
  },
  tg: {
    translation: translationTG,
  },
  // sp: {
  //   translation: translationSP,
  // },
  // kr: {
  //   translation: translationKR,
  // },
  // jpn: {
  //   translation: translationJPN,
  // },
  // gmy: {
  //   translation: translationGMY,
  // },
  // thai: {
  //   translation: translationTHAI,
  // },
  // vn: {
  //   translation: translationVN,
  // },
  // fr: {
  //   translation: translationFR,
  // },
  // cmd: {
  //   translation: translationCMD,
  // },
};

i18n.use(initReactI18next).init({
  resources,
  lng: "en",
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});
root.render(
  <React.StrictMode>
    <I18nextProvider i18n={i18next}>
      <App name={"App"} />
    </I18nextProvider>
    
  </React.StrictMode>
);