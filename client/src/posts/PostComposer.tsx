import { useState, type FormEvent } from "react";
import { getErrorMessage } from "../i18n/errors";
import { useTranslation } from "../i18n/useTranslation";
import { api } from "../lib/api";
import type { Post } from "../lib/types";
import styles from "./PostComposer.module.css";

const MAX_POST_LENGTH = 250;
const LOW_REMAINING = 20;

export function PostComposer({ onPublished }: { onPublished: (post: Post) => void }) {
    const { t } = useTranslation();
    const [text, setText] = useState("");
    const [error, setError] = useState<unknown>(null);
    const [submitting, setSubmitting] = useState(false);
    const remaining = MAX_POST_LENGTH - text.length;

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
        <form className={styles.composer} onSubmit={handleSubmit}>
            <textarea
                aria-label={t("composer.label")}
                placeholder={t("composer.placeholder")}
                maxLength={MAX_POST_LENGTH}
                rows={3}
                value={text}
                onChange={(event) => setText(event.target.value)}
            />
            <div className={styles.footer}>
                <span className={remaining <= LOW_REMAINING ? styles.low : styles.counter}>
                    {remaining}
                </span>
                <button type="submit" disabled={submitting || text.trim().length === 0}>
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
