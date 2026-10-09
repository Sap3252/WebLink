import { useState, type FormEvent } from "react";
import { useAuth } from "../auth/useAuth";
import { Avatar } from "../components/Avatar";
import { getErrorMessage } from "../i18n/errors";
import { useTranslation } from "../i18n/useTranslation";
import { api } from "../lib/api";
import type { Post } from "../lib/types";
import { CharacterRing } from "./CharacterRing";
import styles from "./PostComposer.module.css";

const MAX_POST_LENGTH = 250;
const LOW_REMAINING = 20;

export function PostComposer({ onPublished }: { onPublished: (post: Post) => void }) {
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
            const post = await api<Post>("/posts", { method: "POST", body: { text } });
            onPublished(post);
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
                    aria-label={t("composer.label")}
                    placeholder={t("composer.placeholder")}
                    maxLength={MAX_POST_LENGTH}
                    rows={3}
                    value={text}
                    onChange={(event) => setText(event.target.value)}
                />
            </div>
            <div className={styles.footer}>
                <CharacterRing length={text.length} max={MAX_POST_LENGTH} warnAt={LOW_REMAINING} />
                <button
                    type="submit"
                    className="btn-primary"
                    disabled={submitting || text.trim().length === 0}
                >
                    {submitting ? t("composer.publishing") : t("composer.publish")}
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
