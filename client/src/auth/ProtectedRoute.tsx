import { Navigate, Outlet, useLocation } from "react-router";
import { useTranslation } from "../i18n/useTranslation";
import type { RedirectState } from "./AuthContext";
import { useAuth } from "./useAuth";

export function ProtectedRoute() {
    const { user, loading } = useAuth();
    const { t } = useTranslation();
    const location = useLocation();

    if (loading) {
        return <p>{t("common.loading")}</p>;
    }

    if (!user) {
        const state: RedirectState = { from: location.pathname };
        return <Navigate to="/login" replace state={state} />;
    }

    return <Outlet />;
}
