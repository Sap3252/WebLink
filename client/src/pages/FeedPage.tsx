import { useTranslation } from "../i18n/useTranslation";
import { PostComposer } from "../posts/PostComposer";
import { PostList } from "../posts/PostList";
import { usePaginatedPosts } from "../posts/usePaginatedPosts";

export function FeedPage() {
    const { t } = useTranslation();
    const feed = usePaginatedPosts("/feed");

    return (
        <section>
            <h1>{t("feed.title")}</h1>
            <PostComposer onPublished={feed.addPost} />
            <PostList list={feed} emptyText={t("feed.empty")} />
        </section>
    );
}
