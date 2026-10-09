import { createContext } from "react";
import type { User } from "../lib/types";

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterData extends LoginCredentials {
    username: string;
}

export interface AuthContextValue {
    user: User | null;
    loading: boolean;
    // True when the API rejected the stored token, until the next login or logout.
    sessionExpired: boolean;
    login: (credentials: LoginCredentials) => Promise<void>;
    register: (data: RegisterData) => Promise<void>;
    logout: () => void;
}

// Where ProtectedRoute was trying to go before sending the user to /login.
export interface RedirectState {
    from?: string;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
