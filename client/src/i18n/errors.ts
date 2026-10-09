import { ApiError } from "../lib/api";
import type { TranslateFn } from "./LanguageContext";
import type { TranslationKey } from "./translations";

// The API answers in English; these are the messages the UI knows how to translate.
const API_ERROR_KEYS: Record<string, TranslationKey> = {
    "Invalid credentials": "errors.invalidCredentials",
    "username already in use": "errors.usernameTaken",
    "email already in use": "errors.emailTaken",
    "Password must be at least 8 characters long": "errors.passwordTooShort",
    "username, email and password are required": "errors.missingFields",
    "email and password are required": "errors.missingFields",
    "text is required": "errors.textRequired",
};

export function getErrorMessage(error: unknown, t: TranslateFn): string {
    if (!(error instanceof ApiError)) {
        return t("errors.network");
    }

    const key = API_ERROR_KEYS[error.message];

    return key ? t(key) : error.message;
}
