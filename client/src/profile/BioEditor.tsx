import { useState, type FormEvent } from "react";
import { getErrorMessage } from "../i18n/errors";
import { useTranslation } from "../i18n/useTranslation";
import { api } from "../lib/api";
import type { User } from "../lib/types";
import styles from "./ProfileHeader.module.css";

const MAX_BIO_LENGTH = 100;

interface BioEditorProps {
    initialBio: string;
    onSaved: (bio: string) => void;
    onCancel: () => void;
}

export function BioEditor({ initialBio, onSaved, onCancel }: BioEditorProps) {
    const { t } = useTranslation();
    const [bio, setBio] = useState(initialBio);
    const [error, setError] = useState<unknown>(null);
    const [saving, setSaving] = useState(false);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError(null);
        setSaving(true);

        try {
            const user = await api<User>("/users/me", { method: "PATCH", body: { bio } });
            // On success the parent closes the editor.
            onSaved(user.bio);
        } catch (err) {
            setError(err);
            setSaving(false);
        }
    }

    return (
        <form className={styles.editor} onSubmit={handleSubmit}>
            <textarea
                aria-label={t("profile.bioLabel")}
                maxLength={MAX_BIO_LENGTH}
                rows={2}
                value={bio}
                onChange={(event) => setBio(event.target.value)}
            />
            <div className={styles.editorActions}>
                <span className={styles.meta}>{MAX_BIO_LENGTH - bio.length}</span>
                <button type="button" onClick={onCancel} disabled={saving}>
                    {t("profile.cancel")}
                </button>
                <button type="submit" disabled={saving}>
                    {saving ? t("profile.saving") : t("profile.save")}
                </button>
            </div>
            {error !== null && (
                <p role="alert" className={styles.error}>
                    {getErrorMessage(error, t)}
                </p>
            )}
        </form>
    );
}
