import { Link } from "react-router";
import type { PublicUser } from "../lib/types";
import { Avatar } from "./Avatar";
import styles from "./UserCard.module.css";

export function UserCard({ user }: { user: PublicUser }) {
    return (
        <li>
            <Link to={`/u/${user.username}`} className={`glass ${styles.card}`}>
                <Avatar username={user.username} size={44} />
                <span className={styles.info}>
                    <span className={styles.username}>@{user.username}</span>
                    {user.bio && <span className={styles.bio}>{user.bio}</span>}
                </span>
            </Link>
        </li>
    );
}
