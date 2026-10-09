import { useEffect, useState } from "react";
import { api } from "./api";

// Loads one resource from the API (a profile, a post...) and lets the page update it
// locally after an action, without fetching it again.
export function useApiResource<T>(path: string) {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<unknown>(null);

    useEffect(() => {
        let cancelled = false;

        api<T>(path)
            .then((response) => {
                if (!cancelled) setData(response);
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
    }, [path]);

    return { data, setData, loading, error };
}
