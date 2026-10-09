import { Link, Outlet } from "react-router";
import { useAuth } from "../auth/useAuth";
import { useTranslation } from "../i18n/useTranslation";
import { LanguageSwitcher } from "./LanguageSwitcher";
import styles from "./Layout.module.css";

export function Layout() {
    const { user, logout } = useAuth();
    const { t } = useTranslation();

    return (
        <>
            <header className={styles.header}>
                <Link to="/" className={styles.brand}>
                    WebLink
                </Link>
                <nav className={styles.nav}>
                    <LanguageSwitcher />
                    {user && (
                        <>
                            <Link to={`/u/${user.username}`}>@{user.username}</Link>
                            <button type="button" onClick={logout}>
                                {t("nav.logout")}
                            </button>
                        </>
                    )}
                </nav>
            </header>
            <main className={styles.main}>
                <Outlet />
            </main>
        </>
    );
}
