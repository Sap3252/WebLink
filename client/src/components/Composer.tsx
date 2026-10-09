import { useState, type FormEvent } from "react";
import { useAuth } from "../auth/useAuth";
import { getErrorMessage } from "../i18n/errors";
import { useTranslation } from "../i18n/useTranslation";
import { Avatar } from "./Avatar";
import { CharacterRing } from "./CharacterRing";
import styles from "./Composer.module.css";

// Same limit the API applies to posts and comments.
const MAX_LENGTH = 250;
const LOW_REMAINING = 20;

interface ComposerProps {
    label: string;
    placeholder: string;
    submitLabel: string;
    submittingLabel: string;
    // Publishes the text. If it throws, the text stays and the error is shown.
    onSubmit: (text: string) => Promise<void>;
    rows?: number;
}

export function Composer({
    label,
    placeholder,
    submitLabel,
    submittingLabel,
    onSubmit,
    rows = 3,
}: ComposerProps) {
    const { user } = useAuth();
    const { t } = useTranslation();
    const [text, setText] = useState("");
    const [error, setError] = useState<unknown>(null);
    const [submitting, setSubmitting] = useState(false);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError(null);
        setSubmitting(true);

        try {
            await onSubmit(text);
            setText("");
        } catch (err) {
            setError(err);
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <form className={`glass ${styles.composer}`} onSubmit={handleSubmit}>
            <div className={styles.row}>
                {user && <Avatar username={user.username} />}
                <textarea
                    aria-label={label}
                    placeholder={placeholder}
                    maxLength={MAX_LENGTH}
                    rows={rows}
                    value={text}
                    onChange={(event) => setText(event.target.value)}
                />
            </div>
            <div className={styles.footer}>
                <CharacterRing length={text.length} max={MAX_LENGTH} warnAt={LOW_REMAINING} />
                <button
                    type="submit"
                    className="btn-primary"
                    disabled={submitting || text.trim().length === 0}
                >
                    {submitting ? submittingLabel : submitLabel}
                </button>
            </div>
            {error !== null && (
                <p role="alert" className={styles.error}>
                    {getErrorMessage(error, t)}
                </p>
            )}
        </form>
    );
}
