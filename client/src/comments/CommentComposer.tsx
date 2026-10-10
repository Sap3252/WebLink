import { Composer, type ComposerContent } from "../components/Composer";
import { useTranslation } from "../i18n/useTranslation";
import { api } from "../lib/api";
import type { Comment } from "../lib/types";

interface CommentComposerProps {
    postId: string;
    onPublished: (comment: Comment) => void;
}

export function CommentComposer({ postId, onPublished }: CommentComposerProps) {
    const { t } = useTranslation();

    async function publish({ text }: ComposerContent) {
        const comment = await api<Comment>(`/posts/${postId}/comments`, {
            method: "POST",
            body: { text },
        });
        onPublished(comment);
    }

    return (
        <Composer
            label={t("comments.label")}
            placeholder={t("comments.placeholder")}
            submitLabel={t("comments.publish")}
            submittingLabel={t("comments.publishing")}
            onSubmit={publish}
            rows={2}
        />
    );
}
