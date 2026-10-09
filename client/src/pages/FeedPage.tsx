import { useAuth } from "../auth/useAuth";
import { useTranslation } from "../i18n/useTranslation";

export function FeedPage() {
    const { user } = useAuth();
    const { t } = useTranslation();

    return (
        <section>
            <h1>{t("feed.title")}</h1>
            <p>{t("feed.comingSoon", { username: user?.username ?? "" })}</p>
        </section>
    );
}
