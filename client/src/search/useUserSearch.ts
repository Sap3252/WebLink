import { useEffect, useState } from "react";
import { api } from "../lib/api";
import type { PublicUser } from "../lib/types";
import { useDebouncedValue } from "../lib/useDebouncedValue";

// Wait for a short pause in typing before searching, instead of one request per key.
const SEARCH_DELAY_MS = 300;

interface SearchResult {
    term: string;
    users: PublicUser[];
    error: unknown;
}

export function useUserSearch(query: string) {
    const typed = query.trim();
    const term = useDebouncedValue(typed, SEARCH_DELAY_MS);
    const [result, setResult] = useState<SearchResult | null>(null);

    useEffect(() => {
        if (!term) {
            return;
        }

        let cancelled = false;

        api<{ users: PublicUser[] }>(`/users?q=${encodeURIComponent(term)}`)
            .then((response) => {
                if (!cancelled) setResult({ term, users: response.users, error: null });
            })
            .catch((error: unknown) => {
                if (!cancelled) setResult({ term, users: [], error });
            });

        // A newer search replaces this one: its late answer must not overwrite the results.
        return () => {
            cancelled = true;
        };
    }, [term]);

    // Only show a result that belongs to what is being searched right now.
    const current = term !== "" && result?.term === term ? result : null;

    return {
        term,
        users: current?.users ?? [],
        error: current?.error ?? null,
        searching: typed !== "" && (typed !== term || current === null),
    };
}
