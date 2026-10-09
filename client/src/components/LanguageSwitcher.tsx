import { useTranslation } from "../i18n/useTranslation";
import { LANGUAGES } from "../i18n/translations";
import styles from "./LanguageSwitcher.module.css";

export function LanguageSwitcher() {
    const { language, setLanguage, t } = useTranslation();

    return (
        <div role="group" aria-label={t("language.label")} className={styles.switcher}>
            {LANGUAGES.map((option) => (
                <button
                    key={option}
                    type="button"
                    aria-pressed={option === language}
                    onClick={() => setLanguage(option)}
                >
                    {option.toUpperCase()}
                </button>
            ))}
        </div>
    );
}
