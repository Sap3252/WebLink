import styles from "./CommentIcon.module.css";

// A speech bubble whose tail is a connector ending in a node, like the links icon.
const STROKE = 2;
const NODE = { x: 4.5, y: 20.5, r: 2 };
const TAIL_START = { x: 10, y: 15 };

// The tail stops at the node's outer edge (radius + half the node's stroke + half the
// tail's rounded cap), so it never runs into the node.
const TAIL_GAP = NODE.r + STROKE / 2 + STROKE / 2;
const tailLength = Math.hypot(TAIL_START.x - NODE.x, TAIL_START.y - NODE.y);
const TAIL_END = {
    x: NODE.x + ((TAIL_START.x - NODE.x) / tailLength) * TAIL_GAP,
    y: NODE.y + ((TAIL_START.y - NODE.y) / tailLength) * TAIL_GAP,
};

export function CommentIcon() {
    return (
        <svg viewBox="0 0 24 24" aria-hidden="true" className={styles.icon} strokeWidth={STROKE}>
            <rect x="7" y="3" width="15" height="12" rx="3" />
            <line
                x1={TAIL_START.x}
                y1={TAIL_START.y}
                x2={TAIL_END.x}
                y2={TAIL_END.y}
                pathLength={1}
                className={styles.tail}
            />
            <circle cx={NODE.x} cy={NODE.y} r={NODE.r} className={styles.node} />
        </svg>
    );
}
