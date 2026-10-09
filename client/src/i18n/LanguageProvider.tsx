import { useEffect, useState, type ReactNode } from "react";
import { LanguageContext, type LanguageContextValue } from "./LanguageContext";
import { isLanguage, translations, type Language } from "./translations";

const STORAGE_KEY = "weblink.language";

function getInitialLanguage(): Language {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (isLanguage(stored)) {
        return stored;
    }

    return navigator.language.startsWith("es") ? "es" : "en";
}

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [language, setLanguageState] = useState<Language>(getInitialLanguage);

    useEffect(() => {
        document.documentElement.lang = language;
    }, [language]);

    const value: LanguageContextValue = {
        language,
        setLanguage: (next) => {
            localStorage.setItem(STORAGE_KEY, next);
            setLanguageState(next);
        },
        t: (key, params = {}) =>
            Object.entries(params).reduce(
                (text, [name, replacement]) => text.replaceAll(`{${name}}`, replacement),
                translations[language][key],
            ),
    };

    return <LanguageContext value={value}>{children}</LanguageContext>;
}
