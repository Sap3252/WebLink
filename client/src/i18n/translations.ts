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
    "login.sessionExpired": "Your session expired. Please log in again.",

    "register.title": "Create your account",
    "register.submit": "Sign up",
    "register.submitting": "Creating account...",
    "register.hasAccount": "Already have an account?",
    "register.loginLink": "Log in",

    "feed.title": "Feed",
    "feed.empty": "Your feed is empty. Follow someone or publish your first post.",

    "composer.label": "New post",
    "composer.placeholder": "What's on your mind?",
    "composer.publish": "Post",
    "composer.publishing": "Posting...",

    "posts.loadMore": "Load more",
    "posts.delete": "Delete",
    "posts.deleting": "Deleting...",
    "posts.confirmDelete": "Delete this post? This can't be undone.",

    "profile.joined": "Joined {date}",
    "profile.followersOne": "{count} follower",
    "profile.followersOther": "{count} followers",
    "profile.following": "{count} following",
    "profile.follow": "Follow",
    "profile.unfollow": "Unfollow",
    "profile.editBio": "Edit bio",
    "profile.bioLabel": "Bio",
    "profile.save": "Save",
    "profile.saving": "Saving...",
    "profile.cancel": "Cancel",
    "profile.posts": "Posts",
    "profile.empty": "No posts yet.",

    "errors.network": "Could not connect to the server",
    "errors.invalidCredentials": "Invalid email or password",
    "errors.usernameTaken": "That username is already in use",
    "errors.emailTaken": "That email is already registered",
    "errors.passwordTooShort": "Password must be at least 8 characters long",
    "errors.missingFields": "Please fill in all the fields",
    "errors.textRequired": "Write something before posting",
    "errors.userNotFound": "This user doesn't exist",
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
    "login.sessionExpired": "Tu sesión expiró. Volvé a iniciar sesión.",

    "register.title": "Creá tu cuenta",
    "register.submit": "Registrarme",
    "register.submitting": "Creando cuenta...",
    "register.hasAccount": "¿Ya tenés cuenta?",
    "register.loginLink": "Iniciar sesión",

    "feed.title": "Inicio",
    "feed.empty": "Tu feed está vacío. Seguí a alguien o publicá tu primer post.",

    "composer.label": "Nuevo post",
    "composer.placeholder": "¿Qué está pasando?",
    "composer.publish": "Publicar",
    "composer.publishing": "Publicando...",

    "posts.loadMore": "Cargar más",
    "posts.delete": "Borrar",
    "posts.deleting": "Borrando...",
    "posts.confirmDelete": "¿Borrar este post? No se puede deshacer.",

    "profile.joined": "Se unió en {date}",
    "profile.followersOne": "{count} seguidor",
    "profile.followersOther": "{count} seguidores",
    "profile.following": "{count} siguiendo",
    "profile.follow": "Seguir",
    "profile.unfollow": "Dejar de seguir",
    "profile.editBio": "Editar bio",
    "profile.bioLabel": "Bio",
    "profile.save": "Guardar",
    "profile.saving": "Guardando...",
    "profile.cancel": "Cancelar",
    "profile.posts": "Posts",
    "profile.empty": "Todavía no hay posts.",

    "errors.network": "No se pudo conectar con el servidor",
    "errors.invalidCredentials": "Email o contraseña incorrectos",
    "errors.usernameTaken": "Ese nombre de usuario ya está en uso",
    "errors.emailTaken": "Ese email ya está registrado",
    "errors.passwordTooShort": "La contraseña debe tener al menos 8 caracteres",
    "errors.missingFields": "Completá todos los campos",
    "errors.textRequired": "Escribí algo antes de publicar",
    "errors.userNotFound": "Este usuario no existe",
};

export const translations: Record<Language, Record<TranslationKey, string>> = { en, es };
