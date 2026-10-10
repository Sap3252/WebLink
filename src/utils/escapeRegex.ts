// Escapes the characters that have a special meaning in a regular expression, so text
// typed by a user is searched literally ("a.b" finds "a.b", not "axb") and can't be
// used to build an expensive pattern.
export function escapeRegex(text: string): string {
    return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
