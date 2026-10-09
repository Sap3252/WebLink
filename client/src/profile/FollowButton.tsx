import { useState } from "react";
import { getErrorMessage } from "../i18n/errors";
import { useTranslation } from "../i18n/useTranslation";
import { api } from "../lib/api";
import type { Profile } from "../lib/types";
import styles from "./ProfileHeader.module.css";

interface FollowButtonProps {
    profile: Profile;
    onChange: (isFollowing: boolean) => void;
}

export function FollowButton({ profile, onChange }: FollowButtonProps) {
    const { t } = useTranslation();
    const [pending, setPending] = useState(false);
    const [error, setError] = useState<unknown>(null);
    const isFollowing = profile.isFollowing === true;

    async function handleClick() {
        setPending(true);
        setError(null);

        try {
            await api<unknown>(`/users/${profile._id}/follow`, {
                method: isFollowing ? "DELETE" : "POST",
            });
            onChange(!isFollowing);
        } catch (err) {
            setError(err);
        } finally {
            setPending(false);
        }
    }

    return (
        <div className={styles.action}>
            <button
                type="button"
                aria-pressed={isFollowing}
                disabled={pending}
                onClick={handleClick}
            >
                {isFollowing ? t("profile.unfollow") : t("profile.follow")}
            </button>
            {error !== null && (
                <p role="alert" className={styles.error}>
                    {getErrorMessage(error, t)}
                </p>
            )}
        </div>
    );
}
