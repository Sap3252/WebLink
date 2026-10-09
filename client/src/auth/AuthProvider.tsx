import { useEffect, useState, type ReactNode } from "react";
import { api, ApiError, clearToken, getToken, setToken, setUnauthorizedHandler } from "../lib/api";
import type { AuthResponse, User } from "../lib/types";
import {
    AuthContext,
    type AuthContextValue,
    type LoginCredentials,
    type RegisterData,
} from "./AuthContext";

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(() => getToken() !== null);
    const [sessionExpired, setSessionExpired] = useState(false);

    // Any request that gets a 401 with our token ends the session. ProtectedRoute then
    // sends the user to /login, and public pages simply show the logged-out view.
    useEffect(() => {
        setUnauthorizedHandler(() => {
            clearToken();
            setUser(null);
            setSessionExpired(true);
        });

        return () => setUnauthorizedHandler(null);
    }, []);

    useEffect(() => {
        if (!getToken()) {
            return;
        }

        let cancelled = false;

        api<User>("/auth/me")
            .then((me) => {
                if (!cancelled) setUser(me);
            })
            .catch((error: unknown) => {
                // Deleted user (404): the stored session is no longer valid.
                if (error instanceof ApiError) clearToken();
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, []);

    async function startSession(path: string, body: LoginCredentials | RegisterData) {
        const session = await api<AuthResponse>(path, { method: "POST", body });

        setToken(session.token);
        setUser(session.user);
        setSessionExpired(false);
    }

    const value: AuthContextValue = {
        user,
        loading,
        sessionExpired,
        login: (credentials) => startSession("/auth/login", credentials),
        register: (data) => startSession("/auth/register", data),
        logout: () => {
            clearToken();
            setUser(null);
            setSessionExpired(false);
        },
    };

    return <AuthContext value={value}>{children}</AuthContext>;
}
