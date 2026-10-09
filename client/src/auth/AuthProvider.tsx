import { useEffect, useState, type ReactNode } from "react";
import { api, ApiError, clearToken, getToken, setToken } from "../lib/api";
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
                // Expired token or deleted user: the stored session is no longer valid.
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
    }

    const value: AuthContextValue = {
        user,
        loading,
        login: (credentials) => startSession("/auth/login", credentials),
        register: (data) => startSession("/auth/register", data),
        logout: () => {
            clearToken();
            setUser(null);
        },
    };

    return <AuthContext value={value}>{children}</AuthContext>;
}
