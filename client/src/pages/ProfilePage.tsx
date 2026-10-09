import { useParams } from "react-router";
import { useTranslation } from "../i18n/useTranslation";

export function ProfilePage() {
    const { username = "" } = useParams();
    const { t } = useTranslation();

    return (
        <section>
            <h1>{t("profile.title", { username })}</h1>
            <p>{t("profile.comingSoon")}</p>
        </section>
    );
}
