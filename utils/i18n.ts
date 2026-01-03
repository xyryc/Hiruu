import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Localization from "expo-localization";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "../locales/en.json";
import gr from "../locales/gr.json";

const LANGUAGE_KEY = "@app_language";

// Get saved language or device language
const getLanguage = async () => {
  try {
    const savedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);
    return savedLanguage || Localization.locale.split("-")[0] || "en";
  } catch (error) {
    return "en";
  }
};

i18n.use(initReactI18next).init({
  compatibilityJSON: "v3",
  resources: {
    en: { translation: en },
    gr: { translation: gr },
  },
  lng: "en", // Will be overridden
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

// Set initial language
getLanguage().then((language) => {
  i18n.changeLanguage(language);
});

export default i18n;

// Helper to save language preference
export const saveLanguage = async (language: string) => {
  try {
    await AsyncStorage.setItem(LANGUAGE_KEY, language);
    await i18n.changeLanguage(language);
  } catch (error) {
    console.error("Error saving language:", error);
  }
};
