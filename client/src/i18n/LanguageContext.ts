import { createContext } from "react";
import type { Language, TranslationKey } from "./translations";

export type TranslateFn = (key: TranslationKey, params?: Record<string, string>) => string;

export interface LanguageContextValue {
    language: Language;
    setLanguage: (language: Language) => void;
    t: TranslateFn;
}

export const LanguageContext = createContext<LanguageContextValue | null>(null);
