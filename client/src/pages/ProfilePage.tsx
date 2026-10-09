import { useParams } from "react-router";
import { useAuth } from "../auth/useAuth";
import { getErrorMessage } from "../i18n/errors";
import { useTranslation } from "../i18n/useTranslation";
import { PostList } from "../posts/PostList";
import { usePaginatedPosts } from "../posts/usePaginatedPosts";
import { ProfileHeader } from "../profile/ProfileHeader";
import { useProfile } from "../profile/useProfile";

export function ProfilePage() {
    const { username = "" } = useParams();
    const { user } = useAuth();

    // A new key starts with fresh state when the profile changes, and also when the
    // viewer logs in or out, because `isFollowing` depends on who is looking.
    return <ProfileView key={`${username}:${user?._id ?? "guest"}`} username={username} />;
}

function ProfileView({ username }: { username: string }) {
    const { t } = useTranslation();
    const { profile, setProfile, loading, error } = useProfile(username);
    const posts = usePaginatedPosts(`/users/${encodeURIComponent(username)}/posts`);

    if (loading) {
        return <p>{t("common.loading")}</p>;
    }

    if (!profile) {
        return <p role="alert">{getErrorMessage(error, t)}</p>;
    }

    return (
        <section>
            <ProfileHeader profile={profile} onChange={setProfile} />
            <h2>{t("profile.posts")}</h2>
            <PostList list={posts} emptyText={t("profile.empty")} />
        </section>
    );
}
