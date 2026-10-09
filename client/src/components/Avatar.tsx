import styles from "./Avatar.module.css";

// Turns a username into a stable number, so each user always gets the same colors.
function hashString(value: string): number {
    let hash = 0;

    for (const char of value) {
        hash = (hash * 31 + char.charCodeAt(0)) | 0;
    }

    return Math.abs(hash);
}

interface AvatarProps {
    username: string;
    size?: number;
}

export function Avatar({ username, size = 40 }: AvatarProps) {
    const hue = hashString(username) % 360;
    const background = `linear-gradient(135deg, hsl(${hue} 85% 65%), hsl(${(hue + 50) % 360} 80% 55%))`;

    return (
        <span
            className={styles.avatar}
            style={{ width: size, height: size, fontSize: size * 0.42, background }}
            aria-hidden="true"
        >
            {username.charAt(0).toUpperCase()}
        </span>
    );
}
