import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { useAuth } from "../auth/useAuth";
import { getErrorMessage } from "../i18n/errors";
import type { TranslationKey } from "../i18n/translations";
import { useTranslation } from "../i18n/useTranslation";
import { ACCEPTED_IMAGE_TYPES, IMAGE_ALT_MAX_LENGTH, validateImageFile } from "../lib/images";
import { Avatar } from "./Avatar";
import { CharacterRing } from "./CharacterRing";
import styles from "./Composer.module.css";

// Same limit the API applies to posts and comments.
const MAX_LENGTH = 250;
const LOW_REMAINING = 20;

export interface ComposerContent {
    text: string;
    image: { file: File; alt: string } | null;
}

interface SelectedImage {
    file: File;
    previewUrl: string;
    alt: string;
}

interface ComposerProps {
    label: string;
    placeholder: string;
    submitLabel: string;
    submittingLabel: string;
    // Publishes the content. If it throws, everything stays and the error is shown.
    onSubmit: (content: ComposerContent) => Promise<void>;
    rows?: number;
    // Shows the button to add one photo (posts only).
    allowImage?: boolean;
}

export function Composer({
    label,
    placeholder,
    submitLabel,
    submittingLabel,
    onSubmit,
    rows = 3,
    allowImage = false,
}: ComposerProps) {
    const { user } = useAuth();
    const { t } = useTranslation();
    const [text, setText] = useState("");
    const [image, setImage] = useState<SelectedImage | null>(null);
    const [imageError, setImageError] = useState<TranslationKey | null>(null);
    const [error, setError] = useState<unknown>(null);
    const [submitting, setSubmitting] = useState(false);
    const fileInput = useRef<HTMLInputElement>(null);
    const previewUrl = image?.previewUrl;
    const canSubmit = text.trim().length > 0 || image !== null;

    // The preview is a temporary URL to the file in memory: free it when the photo
    // changes or the composer goes away.
    useEffect(() => {
        if (!previewUrl) return;
        return () => URL.revokeObjectURL(previewUrl);
    }, [previewUrl]);

    function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0];
        // Clear the input so choosing the same file again still fires a change.
        event.target.value = "";

        if (!file) {
            return;
        }

        const problem = validateImageFile(file);
        setImageError(problem);

        if (!problem) {
            setImage({ file, previewUrl: URL.createObjectURL(file), alt: "" });
        }
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError(null);
        setSubmitting(true);

        try {
            await onSubmit({
                text,
                image: image ? { file: image.file, alt: image.alt } : null,
            });
            setText("");
            setImage(null);
        } catch (err) {
            setError(err);
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <form className={`glass ${styles.composer}`} onSubmit={handleSubmit}>
            <div className={styles.row}>
                {user && <Avatar username={user.username} />}
                <textarea
                    aria-label={label}
                    placeholder={placeholder}
                    maxLength={MAX_LENGTH}
                    rows={rows}
                    value={text}
                    onChange={(event) => setText(event.target.value)}
                />
            </div>

            {image && (
                <div className={styles.imagePreview}>
                    <div className={styles.imageFrame}>
                        <img src={image.previewUrl} alt={image.alt} />
                        <button
                            type="button"
                            className={styles.removeImage}
                            onClick={() => setImage(null)}
                            disabled={submitting}
                            aria-label={t("composer.removeImage")}
                            title={t("composer.removeImage")}
                        >
                            <svg viewBox="0 0 24 24" aria-hidden="true">
                                <path d="M6 6l12 12M18 6 6 18" />
                            </svg>
                        </button>
                    </div>
                    <input
                        type="text"
                        className={styles.altInput}
                        aria-label={t("composer.altLabel")}
                        placeholder={t("composer.altPlaceholder")}
                        maxLength={IMAGE_ALT_MAX_LENGTH}
                        value={image.alt}
                        onChange={(event) => setImage({ ...image, alt: event.target.value })}
                    />
                </div>
            )}

            <div className={styles.footer}>
                {allowImage && (
                    <>
                        <input
                            ref={fileInput}
                            type="file"
                            accept={ACCEPTED_IMAGE_TYPES.join(",")}
                            className={styles.fileInput}
                            onChange={handleFileChange}
                            tabIndex={-1}
                            aria-hidden="true"
                        />
                        <button
                            type="button"
                            className={`btn-ghost ${styles.addImage}`}
                            onClick={() => fileInput.current?.click()}
                            disabled={submitting}
                            aria-label={image ? t("composer.changeImage") : t("composer.addImage")}
                            title={image ? t("composer.changeImage") : t("composer.addImage")}
                        >
                            <svg viewBox="0 0 24 24" aria-hidden="true">
                                <rect x="3" y="5" width="18" height="14" rx="3" />
                                <circle cx="9" cy="10" r="1.6" />
                                <path d="m21 16-5-5-8 8" />
                            </svg>
                        </button>
                    </>
                )}
                <CharacterRing length={text.length} max={MAX_LENGTH} warnAt={LOW_REMAINING} />
                <button type="submit" className="btn-primary" disabled={submitting || !canSubmit}>
                    {submitting ? submittingLabel : submitLabel}
                </button>
            </div>

            {imageError && (
                <p role="alert" className={styles.error}>
                    {t(imageError)}
                </p>
            )}
            {error !== null && (
                <p role="alert" className={styles.error}>
                    {getErrorMessage(error, t)}
                </p>
            )}
        </form>
    );
}
