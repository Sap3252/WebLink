import { useTranslation } from "../i18n/useTranslation";
import { useTheme } from "../theme/useTheme";
import styles from "./ThemeToggle.module.css";

export function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();
    const { t } = useTranslation();
    const label = theme === "dark" ? t("theme.toLight") : t("theme.toDark");

    return (
        <button
            type="button"
            className={styles.toggle}
            onClick={toggleTheme}
            aria-label={label}
            title={label}
        >
            {theme === "dark" ? (
                <svg viewBox="0 0 24 24" aria-hidden="true">
                    <circle cx="12" cy="12" r="4.5" />
                    <path d="M12 2v2.5M12 19.5V22M4.2 4.2l1.8 1.8M18 18l1.8 1.8M2 12h2.5M19.5 12H22M4.2 19.8 6 18M18 6l1.8-1.8" />
                </svg>
            ) : (
                <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5a8.5 8.5 0 1 0 11 11Z" />
                </svg>
            )}
        </button>
    );
}
