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
                                title={`@${user.username}`}
                            >
                                <Avatar username={user.username} size={36} />
                            </Link>
                            <button type="button" className="btn-ghost" onClick={logout}>
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
