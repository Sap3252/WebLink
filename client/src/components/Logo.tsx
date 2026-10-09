import { Link } from "react-router";
import styles from "./Logo.module.css";

// The logo is a small network: these are its nodes and the links between them.
const NODES = [
    { x: 12, y: 16, r: 5 },
    { x: 36, y: 11, r: 5 },
    { x: 24, y: 36, r: 6 },
    { x: 40, y: 33, r: 4 },
];

const LINKS: [number, number][] = [
    [0, 1],
    [0, 2],
    [1, 2],
    [1, 3],
    [2, 3],
];

const LINK_STAGGER_S = 0.15;
const NODE_STAGGER_S = 0.2;

export function Logo() {
    return (
        <Link to="/" className={styles.logo}>
            <svg viewBox="0 0 48 48" aria-hidden="true" className={styles.icon}>
                <defs>
                    <linearGradient
                        id="logo-gradient"
                        gradientUnits="userSpaceOnUse"
                        x1="0"
                        y1="0"
                        x2="48"
                        y2="48"
                    >
                        <stop offset="0%" stopColor="#7c5cff" />
                        <stop offset="100%" stopColor="#ff5ca8" />
                    </linearGradient>
                </defs>
                {LINKS.map(([from, to], index) => (
                    <line
                        key={`${from}-${to}`}
                        className={styles.link}
                        x1={NODES[from].x}
                        y1={NODES[from].y}
                        x2={NODES[to].x}
                        y2={NODES[to].y}
                        pathLength={1}
                        style={{ animationDelay: `${index * LINK_STAGGER_S}s` }}
                    />
                ))}
                {NODES.map((node, index) => (
                    <circle
                        key={index}
                        className={styles.node}
                        cx={node.x}
                        cy={node.y}
                        r={node.r}
                        style={{ animationDelay: `${index * NODE_STAGGER_S}s` }}
                    />
                ))}
            </svg>
            <span className={styles.wordmark}>WebLink</span>
        </Link>
    );
}
