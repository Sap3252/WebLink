import styles from "./AuroraBackground.module.css";

// Blurred color blobs behind the whole app: they are what the glass surfaces let through.
export function AuroraBackground() {
    return (
        <div className={styles.aurora} aria-hidden="true">
            <span className={styles.blob1} />
            <span className={styles.blob2} />
            <span className={styles.blob3} />
            <span className={styles.blob4} />
        </div>
    );
}
