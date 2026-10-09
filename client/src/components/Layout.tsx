import { Link, Outlet } from "react-router";
import { useAuth } from "../auth/useAuth";
import { useTranslation } from "../i18n/useTranslation";
import { AuroraBackground } from "./AuroraBackground";
import { Avatar } from "./Avatar";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";
import styles from "./Layout.module.css";

export function Layout() {
    const { user, logout } = useAuth();
    const { t } = useTranslation();

    return (
        <>
            <AuroraBackground />
            <header className={`glass ${styles.header}`}>
                <Logo />
                <nav className={styles.nav}>
                    <LanguageSwitcher />
                    <ThemeToggle />
                    {user && (
                        <>
                            <Link
                                to={`/u/${user.username}`}
                                className={styles.me}
                                aria-label={t("nav.profile")}
                                title={`@${user.username}`}
                            >
                                <Avatar username={user.username} size={36} />
                            </Link>
                            <button
                                type="button"
                                className={`btn-ghost ${styles.logout}`}
                                onClick={logout}
                                title={t("nav.logout")}
                            >
                                <svg viewBox="0 0 24 24" aria-hidden="true">
                                    <path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 17l5-5-5-5M15 12H4" />
                                </svg>
                                <span className={styles.logoutText}>{t("nav.logout")}</span>
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
