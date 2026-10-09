import { useState } from "react";
import { useAuth } from "../auth/useAuth";
import { useTranslation } from "../i18n/useTranslation";
import { api } from "../lib/api";
import type { LinkResult, Post } from "../lib/types";
import styles from "./LinkButton.module.css";

interface LinkState {
    linked: boolean;
    count: number;
}

// Two nodes that get connected by a line when the post is linked.
// The line starts and ends at the outer edge of each node (radius + half the node's
// stroke + half the line's rounded cap), so it never runs into the circles.
const NODE_RADIUS = 3;
const NODE_STROKE = 2;
const BOND_STROKE = 2.2;
const LEFT_NODE_X = 5;
const RIGHT_NODE_X = 23;
const BOND_INSET = NODE_RADIUS + NODE_STROKE / 2 + BOND_STROKE / 2;

function LinkIcon() {
    return (
        <svg viewBox="0 0 28 24" aria-hidden="true" className={styles.icon}>
            <line
                x1={LEFT_NODE_X + BOND_INSET}
                y1="12"
                x2={RIGHT_NODE_X - BOND_INSET}
                y2="12"
                pathLength={1}
                strokeWidth={BOND_STROKE}
                className={styles.bond}
            />
            <circle
                cx={LEFT_NODE_X}
                cy="12"
                r={NODE_RADIUS}
                strokeWidth={NODE_STROKE}
                className={styles.node}
            />
            <circle
                cx={RIGHT_NODE_X}
                cy="12"
                r={NODE_RADIUS}
                strokeWidth={NODE_STROKE}
                className={styles.node}
            />
        </svg>
    );
}

export function LinkButton({ post }: { post: Post }) {
    const { user } = useAuth();
    const { t } = useTranslation();
    const [state, setState] = useState<LinkState>({
        linked: post.linkedByMe,
        count: post.linksCount,
    });
    const [pending, setPending] = useState(false);
    // Only true right after linking, so the "pop" doesn't play for posts that load linked.
    const [celebrating, setCelebrating] = useState(false);
    const countText = t(state.count === 1 ? "links.countOne" : "links.countOther", {
        count: String(state.count),
    });

    if (!user) {
        return (
            <span className={styles.link} title={t("links.loginToLink")}>
                <LinkIcon />
                <span>{state.count}</span>
            </span>
        );
    }

    async function handleClick() {
        if (pending) {
            return;
        }

        const previous = state;

        // Optimistic update: show the change right away and undo it if the server refuses.
        setState({
            linked: !previous.linked,
            count: previous.count + (previous.linked ? -1 : 1),
        });
        setCelebrating(!previous.linked);
        setPending(true);

        try {
            const result = await api<LinkResult>(`/posts/${post._id}/link`, {
                method: previous.linked ? "DELETE" : "POST",
            });
            setState({ linked: result.linkedByMe, count: result.linksCount });
        } catch {
            setState(previous);
            setCelebrating(false);
        } finally {
            setPending(false);
        }
    }

    const classes = [
        "btn-ghost",
        styles.link,
        state.linked ? styles.linked : "",
        celebrating ? styles.celebrating : "",
    ].join(" ");

    return (
        <button
            type="button"
            className={classes}
            aria-pressed={state.linked}
            aria-label={`${state.linked ? t("links.remove") : t("links.add")} (${countText})`}
            title={state.linked ? t("links.remove") : t("links.add")}
            onClick={handleClick}
            onAnimationEnd={() => setCelebrating(false)}
        >
            <LinkIcon />
            <span>{state.count}</span>
        </button>
    );
}
