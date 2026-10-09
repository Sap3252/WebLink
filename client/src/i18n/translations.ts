export type Language = "en" | "es";

export const LANGUAGES: Language[] = ["en", "es"];

export function isLanguage(value: unknown): value is Language {
    return LANGUAGES.includes(value as Language);
}

const en = {
    "common.loading": "Loading...",
    "language.label": "Language",
    "nav.logout": "Log out",

    "fields.username": "Username",
    "fields.email": "Email",
    "fields.password": "Password",
    "fields.passwordHint": "At least 8 characters",

    "login.title": "Log in",
    "login.submit": "Log in",
    "login.submitting": "Logging in...",
    "login.noAccount": "New to WebLink?",
    "login.registerLink": "Create an account",

    "register.title": "Create your account",
    "register.submit": "Sign up",
    "register.submitting": "Creating account...",
    "register.hasAccount": "Already have an account?",
    "register.loginLink": "Log in",

    "feed.title": "Feed",
    "feed.comingSoon": "Hi, {username}! The feed is coming soon.",

    "profile.title": "@{username}",
    "profile.comingSoon": "The profile page is coming soon.",

    "errors.network": "Could not connect to the server",
    "errors.invalidCredentials": "Invalid email or password",
    "errors.usernameTaken": "That username is already in use",
    "errors.emailTaken": "That email is already registered",
    "errors.passwordTooShort": "Password must be at least 8 characters long",
    "errors.missingFields": "Please fill in all the fields",
};

export type TranslationKey = keyof typeof en;

const es: Record<TranslationKey, string> = {
    "common.loading": "Cargando...",
    "language.label": "Idioma",
    "nav.logout": "Cerrar sesión",

    "fields.username": "Nombre de usuario",
    "fields.email": "Email",
    "fields.password": "Contraseña",
    "fields.passwordHint": "Mínimo 8 caracteres",

    "login.title": "Iniciar sesión",
    "login.submit": "Entrar",
    "login.submitting": "Entrando...",
    "login.noAccount": "¿Nuevo en WebLink?",
    "login.registerLink": "Crear una cuenta",

    "register.title": "Creá tu cuenta",
    "register.submit": "Registrarme",
    "register.submitting": "Creando cuenta...",
    "register.hasAccount": "¿Ya tenés cuenta?",
    "register.loginLink": "Iniciar sesión",

    "feed.title": "Inicio",
    "feed.comingSoon": "¡Hola, {username}! El feed llega pronto.",

    "profile.title": "@{username}",
    "profile.comingSoon": "La página de perfil llega pronto.",

    "errors.network": "No se pudo conectar con el servidor",
    "errors.invalidCredentials": "Email o contraseña incorrectos",
    "errors.usernameTaken": "Ese nombre de usuario ya está en uso",
    "errors.emailTaken": "Ese email ya está registrado",
    "errors.passwordTooShort": "La contraseña debe tener al menos 8 caracteres",
    "errors.missingFields": "Completá todos los campos",
};

export const translations: Record<Language, Record<TranslationKey, string>> = { en, es };
