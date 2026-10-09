import { getErrorMessage } from "../i18n/errors";
import { useTranslation } from "../i18n/useTranslation";
import { PostCard } from "./PostCard";
import styles from "./PostList.module.css";
import type { PaginatedPosts } from "./usePaginatedPosts";

interface PostListProps {
    list: PaginatedPosts;
    emptyText: string;
}

export function PostList({ list, emptyText }: PostListProps) {
    const { t } = useTranslation();

    if (list.loading) {
        return <p>{t("common.loading")}</p>;
    }

    return (
        <div>
            {list.posts.length === 0 && list.error === null && (
                <p className={styles.empty}>{emptyText}</p>
            )}
            {list.posts.map((post) => (
                <PostCard key={post._id} post={post} />
            ))}
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
