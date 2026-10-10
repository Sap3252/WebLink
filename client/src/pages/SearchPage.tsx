import { useSearchParams } from "react-router";
import { UserCard } from "../components/UserCard";
import { getErrorMessage } from "../i18n/errors";
import { useTranslation } from "../i18n/useTranslation";
import { useUserSearch } from "../search/useUserSearch";
import styles from "./SearchPage.module.css";

const USERNAME_MAX_LENGTH = 30;

export function SearchPage() {
    const { t } = useTranslation();
    // The query lives in the URL (/search?q=santi): back button and shared links work.
    const [searchParams, setSearchParams] = useSearchParams();
    const query = searchParams.get("q") ?? "";
    const { term, users, error, searching } = useUserSearch(query);

    function handleChange(value: string) {
        setSearchParams(value ? { q: value } : {}, { replace: true });
    }

    function renderStatus() {
        if (query.trim() === "") return t("search.hint");
        if (searching) return t("search.searching");
        if (error !== null) return getErrorMessage(error, t);
        if (users.length === 0) return t("search.empty", { query: term });
        return null;
    }

    const status = renderStatus();

    return (
        <section>
            <h1>{t("search.title")}</h1>
            <form
                role="search"
                className={`glass ${styles.searchBox}`}
                onSubmit={(event) => event.preventDefault()}
            >
                <svg viewBox="0 0 24 24" aria-hidden="true" className={styles.icon}>
                    <circle cx="10.5" cy="10.5" r="6.5" />
                    <path d="m20 20-4.8-4.8" />
                </svg>
                <input
                    type="search"
                    aria-label={t("search.label")}
                    placeholder={t("search.placeholder")}
                    maxLength={USERNAME_MAX_LENGTH}
                    autoFocus
                    value={query}
                    onChange={(event) => handleChange(event.target.value)}
                />
            </form>
            {status && (
                <p role="status" className={error !== null ? styles.error : styles.status}>
                    {status}
                </p>
            )}
            <ul className={styles.results}>
                {users.map((user) => (
                    <UserCard key={user._id} user={user} />
                ))}
            </ul>
        </section>
    );
}
