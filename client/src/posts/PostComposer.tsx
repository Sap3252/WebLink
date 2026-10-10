import { Composer, type ComposerContent } from "../components/Composer";
import { useTranslation } from "../i18n/useTranslation";
import { api } from "../lib/api";
import { uploadImage } from "../lib/images";
import type { Post } from "../lib/types";

export function PostComposer({ onPublished }: { onPublished: (post: Post) => void }) {
    const { t } = useTranslation();

    async function publish({ text, image }: ComposerContent) {
        // First the photo goes to Cloudinary, then the post points to it.
        const uploadedImage = image
            ? { publicId: await uploadImage(image.file), alt: image.alt }
            : undefined;

        const post = await api<Post>("/posts", {
            method: "POST",
            body: { text, image: uploadedImage },
        });
        onPublished(post);
    }

    return (
        <Composer
            label={t("composer.label")}
            placeholder={t("composer.placeholder")}
            submitLabel={t("composer.publish")}
            submittingLabel={t("composer.publishing")}
            onSubmit={publish}
            allowImage
        />
    );
}
