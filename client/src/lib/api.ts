// 1. constantes
const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000/api";
const TOKEN_KEY = "weblink.token";

// 2. el token en localStorage
export function getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
    localStorage.removeItem(TOKEN_KEY);
}

// 3. un error que lleve el status
export class ApiError extends Error {
    status: number;

    constructor(status: number, message: string) {
        super(message);
        this.name = "ApiError";
        this.status = status;
    }
}

// 4. las opciones que acepta una llamada
interface RequestOptions {
    method?: string;
    body?: unknown;
}

// 5. qué hacer cuando un request con token recibe 401 (token vencido o inválido)
let unauthorizedHandler: (() => void) | null = null;

export function setUnauthorizedHandler(handler: (() => void) | null): void {
    unauthorizedHandler = handler;
}

// 6. la función principal
export async function api<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const { method = "GET", body } = options;

    const headers: Record<string, string> = {};
    if (body !== undefined) headers["Content-Type"] = "application/json";

    const token = getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(`${BASE_URL}${path}`, {
        method,
        headers,
        body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    // 204 No Content: no hay body que parsear
    if (res.status === 204) {
        return undefined as T;
    }

    const data = await res.json().catch(() => null);

    if (!res.ok) {
        // Sin token (por ejemplo, un login fallido) un 401 no significa que la sesión venció.
        if (res.status === 401 && token) {
            unauthorizedHandler?.();
        }

        const message =
            (data as { error?: string } | null)?.error ?? `Request failed (${res.status})`;
        throw new ApiError(res.status, message);
    }

    return data as T;
}
