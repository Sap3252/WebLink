import { useState, type FormEvent } from "react";
import { Link, useLocation } from "react-router";
import { useAuth } from "../auth/useAuth";
import { FormField } from "../components/FormField";
import { getErrorMessage } from "../i18n/errors";
import { useTranslation } from "../i18n/useTranslation";
import styles from "./AuthPage.module.css";

export function LoginPage() {
    const { login, sessionExpired } = useAuth();
    const { t } = useTranslation();
    const location = useLocation();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<unknown>(null);
    const [submitting, setSubmitting] = useState(false);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError(null);
        setSubmitting(true);

        try {
            // On success GuestRoute sees the new user and redirects.
            await login({ email, password });
        } catch (err) {
            setError(err);
            setSubmitting(false);
        }
    }

    return (
        <section className={`glass ${styles.card}`}>
            <h1>{t("login.title")}</h1>
            {sessionExpired && (
                <p role="status" className={styles.notice}>
                    {t("login.sessionExpired")}
                </p>
            )}
            <form className={styles.form} onSubmit={handleSubmit}>
                <FormField
                    label={t("fields.email")}
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                />
                <FormField
                    label={t("fields.password")}
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                />
                {error !== null && (
                    <p role="alert" className={styles.error}>
                        {getErrorMessage(error, t)}
                    </p>
                )}
                <button type="submit" className="btn-primary" disabled={submitting}>
                    {submitting ? t("login.submitting") : t("login.submit")}
                </button>
            </form>
            <p>
                {t("login.noAccount")}{" "}
                <Link to="/register" state={location.state}>
                    {t("login.registerLink")}
                </Link>
            </p>
        </section>
    );
}
