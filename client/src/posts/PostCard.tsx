import { Link } from "react-router";
import { useTranslation } from "../i18n/useTranslation";
import type { Post } from "../lib/types";
import styles from "./PostCard.module.css";

export function PostCard({ post }: { post: Post }) {
    const { language } = useTranslation();
    const date = new Intl.DateTimeFormat(language, {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(new Date(post.createdAt));

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
        </article>
    );
}
