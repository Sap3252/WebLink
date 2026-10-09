import { useEffect, useState } from "react";
import { api } from "../lib/api";
import type { Profile } from "../lib/types";

export function useProfile(username: string) {
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<unknown>(null);

    useEffect(() => {
        let cancelled = false;

        api<Profile>(`/users/${encodeURIComponent(username)}`)
            .then((data) => {
                if (!cancelled) setProfile(data);
            })
            .catch((err: unknown) => {
                if (!cancelled) setError(err);
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, [username]);

    return { profile, setProfile, loading, error };
}
