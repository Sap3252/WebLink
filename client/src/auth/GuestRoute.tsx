import { Navigate, Outlet, useLocation } from "react-router";
import { useTranslation } from "../i18n/useTranslation";
import type { RedirectState } from "./AuthContext";
import { useAuth } from "./useAuth";

// Pages for logged-out users only (login, register). Once there is a user,
// it sends them back to where they were going, or to the feed.
export function GuestRoute() {
    const { user, loading } = useAuth();
    const { t } = useTranslation();
    const location = useLocation();

    if (loading) {
        return <p>{t("common.loading")}</p>;
    }

    if (user) {
        const from = (location.state as RedirectState | null)?.from ?? "/";
        return <Navigate to={from} replace />;
    }

    return <Outlet />;
}
