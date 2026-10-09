import { useTranslation } from "../i18n/useTranslation";
import styles from "./CharacterRing.module.css";

const RADIUS = 10;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

interface CharacterRingProps {
    length: number;
    max: number;
    // From this many characters left, the ring turns orange and shows the number.
    warnAt: number;
}

export function CharacterRing({ length, max, warnAt }: CharacterRingProps) {
    const { t } = useTranslation();
    const remaining = max - length;
    const progress = Math.min(length / max, 1);
    const state = remaining <= 0 ? styles.full : remaining <= warnAt ? styles.warn : "";
    const label = t("composer.remaining", { count: String(remaining) });

    return (
        <span className={`${styles.ring} ${state}`} role="img" aria-label={label} title={label}>
            <svg viewBox="0 0 24 24" className={styles.svg}>
                <circle cx="12" cy="12" r={RADIUS} className={styles.track} />
                <circle
                    cx="12"
                    cy="12"
                    r={RADIUS}
                    className={styles.progress}
                    strokeDasharray={CIRCUMFERENCE}
                    strokeDashoffset={CIRCUMFERENCE * (1 - progress)}
                />
            </svg>
            {remaining <= warnAt && <span className={styles.count}>{remaining}</span>}
        </span>
    );
}
