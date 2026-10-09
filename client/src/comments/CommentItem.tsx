import { Link } from "react-router";
import { Avatar } from "../components/Avatar";
import { getErrorMessage } from "../i18n/errors";
import { useTranslation } from "../i18n/useTranslation";
import type { Comment } from "../lib/types";
import { useConfirmedDelete } from "../lib/useConfirmedDelete";
import styles from "./CommentItem.module.css";

interface CommentItemProps {
    comment: Comment;
    // Only passed when the current user can delete this comment.
    onDelete?: () => Promise<void>;
}

export function CommentItem({ comment, onDelete }: CommentItemProps) {
    const { language, t } = useTranslation();
    const { deleting, error, confirmAndDelete } = useConfirmedDelete(
        onDelete,
        t("comments.confirmDelete"),
    );
    const date = new Intl.DateTimeFormat(language, {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(new Date(comment.createdAt));

    return (
        <li className={`glass ${styles.comment}`}>
            <Avatar username={comment.author.username} size={32} />
            <div className={styles.body}>
                <header className={styles.header}>
                    <Link to={`/u/${comment.author.username}`} className={styles.author}>
                        @{comment.author.username}
                    </Link>
                    <time dateTime={comment.createdAt} className={styles.date}>
                        {date}
                    </time>
                </header>
                <p className={styles.text}>{comment.text}</p>
                {onDelete && (
                    <div className={styles.footer}>
                        <button
                            type="button"
                            className={`btn-ghost ${styles.delete}`}
                            disabled={deleting}
                            onClick={confirmAndDelete}
                        >
                            {deleting ? t("comments.deleting") : t("comments.delete")}
                        </button>
                    </div>
                )}
                {error !== null && (
                    <p role="alert" className={styles.error}>
                        {getErrorMessage(error, t)}
                    </p>
                )}
            </div>
        </li>
    );
}
