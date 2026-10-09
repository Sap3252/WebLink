import { useState } from "react";
import { Link } from "react-router";
import { Avatar } from "../components/Avatar";
import { getErrorMessage } from "../i18n/errors";
import { useTranslation } from "../i18n/useTranslation";
import type { Post } from "../lib/types";
import { useConfirmedDelete } from "../lib/useConfirmedDelete";
import { CommentIcon } from "./CommentIcon";
import { LinkButton } from "./LinkButton";
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
    // False on the post's own page, where the comments are already below.
    showCommentsLink?: boolean;
}

export function PostCard({ post, enterIndex, onDelete, showCommentsLink = true }: PostCardProps) {
    const { language, t } = useTranslation();
    const { deleting, error, confirmAndDelete } = useConfirmedDelete(
        onDelete,
        t("posts.confirmDelete"),
    );
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
    const commentsLabel = t(
        post.commentsCount === 1 ? "comments.countOne" : "comments.countOther",
        {
            count: String(post.commentsCount),
        },
    );

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
                    <Link to={`/p/${post._id}`} className={styles.dateLink}>
                        <time dateTime={post.createdAt}>{date}</time>
                    </Link>
                </header>
                <p className={styles.text}>{post.text}</p>
                <footer className={styles.footer}>
                    <div className={styles.actions}>
                        <LinkButton post={post} />
                        {showCommentsLink && (
                            <Link
                                to={`/p/${post._id}`}
                                className={styles.comments}
                                aria-label={commentsLabel}
                                title={commentsLabel}
                            >
                                <CommentIcon />
                                <span>{post.commentsCount}</span>
                            </Link>
                        )}
                    </div>
                    {onDelete && (
                        <button
                            type="button"
                            className={`btn-ghost ${styles.delete}`}
                            disabled={deleting}
                            onClick={confirmAndDelete}
                        >
                            {deleting ? t("posts.deleting") : t("posts.delete")}
                        </button>
                    )}
                </footer>
                {error !== null && (
                    <p role="alert" className={styles.error}>
                        {getErrorMessage(error, t)}
                    </p>
                )}
            </div>
        </article>
    );
}
