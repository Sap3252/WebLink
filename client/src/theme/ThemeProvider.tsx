import { useEffect, useState, type ReactNode } from "react";
import { ThemeContext, type Theme, type ThemeContextValue } from "./ThemeContext";

const STORAGE_KEY = "weblink.theme";
const DARK_QUERY = "(prefers-color-scheme: dark)";

function getSavedTheme(): Theme | null {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === "light" || saved === "dark" ? saved : null;
}

function getSystemTheme(): Theme {
    return matchMedia(DARK_QUERY).matches ? "dark" : "light";
}

// Same rule as the inline script in index.html: saved choice first, otherwise the system.
export function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setTheme] = useState<Theme>(() => getSavedTheme() ?? getSystemTheme());

    useEffect(() => {
        document.documentElement.dataset.theme = theme;
    }, [theme]);

    // Until the user picks a theme with the button, follow the system when it changes.
    useEffect(() => {
        const media = matchMedia(DARK_QUERY);

        function handleChange() {
            if (getSavedTheme() === null) setTheme(getSystemTheme());
        }

        media.addEventListener("change", handleChange);
        return () => media.removeEventListener("change", handleChange);
    }, []);

    const value: ThemeContextValue = {
        theme,
        toggleTheme: () => {
            const next = theme === "dark" ? "light" : "dark";
            localStorage.setItem(STORAGE_KEY, next);
            setTheme(next);
        },
    };

    return <ThemeContext value={value}>{children}</ThemeContext>;
}
