import { useState } from "react";
import { useAuth } from "../auth/useAuth";
import { useTranslation } from "../i18n/useTranslation";
import type { Profile } from "../lib/types";
import { BioEditor } from "./BioEditor";
import { FollowButton } from "./FollowButton";
import styles from "./ProfileHeader.module.css";

interface ProfileHeaderProps {
    profile: Profile;
    onChange: (profile: Profile) => void;
}

export function ProfileHeader({ profile, onChange }: ProfileHeaderProps) {
    const { user } = useAuth();
    const { language, t } = useTranslation();
    const [editing, setEditing] = useState(false);
    const isOwnProfile = user?._id === profile._id;
    const joined = new Intl.DateTimeFormat(language, { month: "long", year: "numeric" }).format(
        new Date(profile.createdAt),
    );
    const followersKey =
        profile.followers === 1 ? "profile.followersOne" : "profile.followersOther";

    function handleFollowChange(isFollowing: boolean) {
        onChange({
            ...profile,
            isFollowing,
            followers: profile.followers + (isFollowing ? 1 : -1),
        });
    }

    function handleBioSaved(bio: string) {
        onChange({ ...profile, bio });
        setEditing(false);
    }

    return (
        <header className={styles.header}>
            <div className={styles.top}>
                <h1 className={styles.username}>@{profile.username}</h1>
                {isOwnProfile && !editing && (
                    <button type="button" onClick={() => setEditing(true)}>
                        {t("profile.editBio")}
                    </button>
                )}
                {!isOwnProfile && user && (
                    <FollowButton profile={profile} onChange={handleFollowChange} />
                )}
            </div>
            {editing ? (
                <BioEditor
                    initialBio={profile.bio}
                    onSaved={handleBioSaved}
                    onCancel={() => setEditing(false)}
                />
            ) : (
                profile.bio && <p className={styles.bio}>{profile.bio}</p>
            )}
            <p className={styles.meta}>{t("profile.joined", { date: joined })}</p>
            <p className={styles.meta}>
                {t(followersKey, { count: String(profile.followers) })} ·{" "}
                {t("profile.following", { count: String(profile.following) })}
            </p>
        </header>
    );
}
