import { useState, type FormEvent } from "react";
import { Link, useLocation } from "react-router";
import { useAuth } from "../auth/useAuth";
import { FormField } from "../components/FormField";
import { getErrorMessage } from "../i18n/errors";
import { useTranslation } from "../i18n/useTranslation";
import styles from "./AuthPage.module.css";

const MIN_PASSWORD_LENGTH = 8;
const MAX_USERNAME_LENGTH = 30;

export function RegisterPage() {
    const { register } = useAuth();
    const { t } = useTranslation();
    const location = useLocation();
    const [username, setUsername] = useState("");
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
            await register({ username, email, password });
        } catch (err) {
            setError(err);
            setSubmitting(false);
        }
    }

    return (
        <section className={styles.card}>
            <h1>{t("register.title")}</h1>
            <form className={styles.form} onSubmit={handleSubmit}>
                <FormField
                    label={t("fields.username")}
                    autoComplete="username"
                    maxLength={MAX_USERNAME_LENGTH}
                    required
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                />
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
                    hint={t("fields.passwordHint")}
                    type="password"
                    autoComplete="new-password"
                    minLength={MIN_PASSWORD_LENGTH}
                    required
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                />
                {error !== null && (
                    <p role="alert" className={styles.error}>
                        {getErrorMessage(error, t)}
                    </p>
                )}
                <button type="submit" disabled={submitting}>
                    {submitting ? t("register.submitting") : t("register.submit")}
                </button>
            </form>
            <p>
                {t("register.hasAccount")}{" "}
                <Link to="/login" state={location.state}>
                    {t("register.loginLink")}
                </Link>
            </p>
        </section>
    );
}
