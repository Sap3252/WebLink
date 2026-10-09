import { useState } from "react";
import { Link } from "react-router";
import { Avatar } from "../components/Avatar";
import { getErrorMessage } from "../i18n/errors";
import { useTranslation } from "../i18n/useTranslation";
import type { Post } from "../lib/types";
import styles from "./PostCard.module.css";

const STAGGER_MS = 80;
const STAGGER_GROUP = 10;

interface PostCardProps {
    post: Post;
    // Position in the list when the card first appears: even slides in from the left,
    // odd from the right, and each one waits a little longer than the previous.
    enterIndex: number;
    // Only passed when the current user can delete this post.
    onDelete?: () => Promise<void>;
}

export function PostCard({ post, enterIndex, onDelete }: PostCardProps) {
    const { language, t } = useTranslation();
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState<unknown>(null);
    // Read only on mount: when a post is added or removed the others shift position,
    // and recalculating here would replay their entrance.
    const [entrance] = useState(() => ({
        className: enterIndex % 2 === 0 ? styles.fromLeft : styles.fromRight,
        delay: `${(enterIndex % STAGGER_GROUP) * STAGGER_MS}ms`,
    }));
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
        <article
            className={`glass ${styles.post} ${entrance.className}`}
            style={{ animationDelay: entrance.delay }}
        >
            <Avatar username={post.author.username} />
            <div className={styles.body}>
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
                            className={`btn-ghost ${styles.delete}`}
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
            </div>
        </article>
    );
}
