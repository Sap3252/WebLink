import { useState } from "react";
import { Link, useLocation, useParams } from "react-router";
import type { RedirectState } from "../auth/AuthContext";
import { useAuth } from "../auth/useAuth";
import { CommentComposer } from "../comments/CommentComposer";
import { CommentList } from "../comments/CommentList";
import { useComments } from "../comments/useComments";
import { getErrorMessage } from "../i18n/errors";
import { useTranslation } from "../i18n/useTranslation";
import { api } from "../lib/api";
import type { Comment, DeletedPost, Post } from "../lib/types";
import { useApiResource } from "../lib/useApiResource";
import { PostCard } from "../posts/PostCard";
import styles from "./PostPage.module.css";

export function PostPage() {
    const { id = "" } = useParams();
    const { user } = useAuth();

    // Fresh state per post, and again when the viewer logs in or out
    // (linkedByMe and who can delete comments depend on who is looking).
    return <PostView key={`${id}:${user?._id ?? "guest"}`} id={id} />;
}

function PostView({ id }: { id: string }) {
    const { user } = useAuth();
    const { t } = useTranslation();
    const location = useLocation();
    const {
        data: post,
        setData: setPost,
        loading,
        error,
    } = useApiResource<Post | DeletedPost>(`/posts/${id}`);
    const comments = useComments(id);
    // Comments added or removed on this page, on top of the count the post came with.
    const [commentsDelta, setCommentsDelta] = useState(0);

    if (loading) {
        return <p className={styles.status}>{t("common.loading")}</p>;
    }

    if (!post) {
        return (
            <p role="alert" className={styles.status}>
                {getErrorMessage(error, t)}
            </p>
        );
    }

    const isDeleted = "deleted" in post;
    const postAuthorId = isDeleted ? null : post.author._id;
    const commentsCount = post.commentsCount + commentsDelta;
    const loginState: RedirectState = { from: location.pathname };

    function canDeleteComment(comment: Comment) {
        return user !== null && (comment.author._id === user._id || postAuthorId === user._id);
    }

    function handleCommentPublished(comment: Comment) {
        comments.prepend(comment);
        setCommentsDelta((delta) => delta + 1);
    }

    async function deletePost() {
        if (!post || "deleted" in post) {
            return;
        }

        await api<void>(`/posts/${post._id}`, { method: "DELETE" });
        // Show what anyone opening this page would see from now on.
        setPost({
            _id: post._id,
            deleted: true,
            commentsCount,
            createdAt: post.createdAt,
            deletedAt: new Date().toISOString(),
        });
    }

    return (
        <section>
            <h1 className={styles.title}>{t("post.title")}</h1>

            {isDeleted ? (
                <p className={`glass ${styles.deleted}`}>{t("post.deleted")}</p>
            ) : (
                <PostCard
                    post={post}
                    enterIndex={0}
                    showCommentsLink={false}
                    onDelete={postAuthorId === user?._id ? deletePost : undefined}
                />
            )}

            <h2 className={styles.commentsTitle}>
                {t("comments.title")}
                <span className={styles.count}>{commentsCount}</span>
            </h2>

            {isDeleted ? (
                <p className={styles.notice}>{t("comments.closed")}</p>
            ) : user ? (
                <CommentComposer postId={id} onPublished={handleCommentPublished} />
            ) : (
                <p className={styles.notice}>
                    {t("comments.loginToComment")}{" "}
                    <Link to="/login" state={loginState}>
                        {t("comments.loginLink")}
                    </Link>
                </p>
            )}

            <CommentList
                list={comments}
                canDelete={canDeleteComment}
                onDeleted={() => setCommentsDelta((delta) => delta - 1)}
            />
        </section>
    );
}
