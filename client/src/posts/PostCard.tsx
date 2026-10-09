import { useState } from "react";
import { Link } from "react-router";
import { getErrorMessage } from "../i18n/errors";
import { useTranslation } from "../i18n/useTranslation";
import type { Post } from "../lib/types";
import styles from "./PostCard.module.css";

interface PostCardProps {
    post: Post;
    // Only passed when the current user can delete this post.
    onDelete?: () => Promise<void>;
}

export function PostCard({ post, onDelete }: PostCardProps) {
    const { language, t } = useTranslation();
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState<unknown>(null);
    const date = new Intl.DateTimeFormat(language, {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(new Date(post.createdAt));

    async function handleDelete() {
        if (!onDelete || !window.confirm(t("posts.confirmDelete"))) {
            return;
        }

        setDeleting(true);
        setError(null);

        try {
            // On success the list drops this post and the card unmounts.
            await onDelete();
        } catch (err) {
            setError(err);
            setDeleting(false);
        }
    }

    return (
        <article className={styles.post}>
            <header className={styles.header}>
                <Link to={`/u/${post.author.username}`} className={styles.author}>
                    @{post.author.username}
                </Link>
                <time dateTime={post.createdAt} className={styles.date}>
                    {date}
                </time>
            </header>
            <p className={styles.text}>{post.text}</p>
            {onDelete && (
                <footer className={styles.footer}>
                    <button
                        type="button"
                        className={styles.delete}
                        disabled={deleting}
                        onClick={handleDelete}
                    >
                        {deleting ? t("posts.deleting") : t("posts.delete")}
                    </button>
                </footer>
            )}
            {error !== null && (
                <p role="alert" className={styles.error}>
                    {getErrorMessage(error, t)}
                </p>
            )}
        </article>
    );
}
