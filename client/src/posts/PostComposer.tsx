import { Composer } from "../components/Composer";
import { useTranslation } from "../i18n/useTranslation";
import { api } from "../lib/api";
import type { Post } from "../lib/types";

export function PostComposer({ onPublished }: { onPublished: (post: Post) => void }) {
    const { t } = useTranslation();

    async function publish(text: string) {
        const post = await api<Post>("/posts", { method: "POST", body: { text } });
        onPublished(post);
    }

    return (
        <Composer
            label={t("composer.label")}
            placeholder={t("composer.placeholder")}
            submitLabel={t("composer.publish")}
            submittingLabel={t("composer.publishing")}
            onSubmit={publish}
        />
    );
}
