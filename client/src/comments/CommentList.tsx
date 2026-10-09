import { getErrorMessage } from "../i18n/errors";
import { useTranslation } from "../i18n/useTranslation";
import type { Comment } from "../lib/types";
import { CommentItem } from "./CommentItem";
import styles from "./CommentList.module.css";
import type { CommentsList } from "./useComments";

interface CommentListProps {
    list: CommentsList;
    canDelete: (comment: Comment) => boolean;
    onDeleted: () => void;
}

export function CommentList({ list, canDelete, onDeleted }: CommentListProps) {
    const { t } = useTranslation();

    if (list.loading) {
        return <p className={styles.loading}>{t("common.loading")}</p>;
    }

    return (
        <div>
            {list.items.length === 0 && list.error === null && (
                <p className={styles.empty}>{t("comments.empty")}</p>
            )}
            <ul className={styles.list}>
                {list.items.map((comment) => (
                    <CommentItem
                        key={comment._id}
                        comment={comment}
                        onDelete={
                            canDelete(comment)
                                ? async () => {
                                      await list.deleteComment(comment._id);
                                      onDeleted();
                                  }
                                : undefined
                        }
                    />
                ))}
            </ul>
            {list.error !== null && (
                <p role="alert" className={styles.error}>
                    {getErrorMessage(list.error, t)}
                </p>
            )}
            {list.hasMore && (
                <button
                    type="button"
                    className={styles.loadMore}
                    disabled={list.loadingMore}
                    onClick={list.loadMore}
                >
                    {list.loadingMore ? t("common.loading") : t("posts.loadMore")}
                </button>
            )}
        </div>
    );
}
