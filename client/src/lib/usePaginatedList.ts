import { useEffect, useState } from "react";
import { api } from "./api";

export interface ListPage<T> {
    items: T[];
    nextCursor: string | null;
}

export interface PaginatedList<T> {
    items: T[];
    loading: boolean;
    loadingMore: boolean;
    hasMore: boolean;
    error: unknown;
    loadMore: () => Promise<void>;
    prepend: (item: T) => void;
    remove: (id: string) => void;
}

// Loads a cursor-paginated list from the API (posts, comments...) and keeps the cursor.
// `toPage` adapts the API response: define it outside the component so it stays the same
// function between renders. To load a different list, give the component a new `key`.
export function usePaginatedList<T extends { _id: string }, Response>(
    path: string,
    toPage: (response: Response) => ListPage<T>,
): PaginatedList<T> {
    const [items, setItems] = useState<T[]>([]);
    const [nextCursor, setNextCursor] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState<unknown>(null);

    useEffect(() => {
        let cancelled = false;

        api<Response>(path)
            .then((response) => {
                if (cancelled) return;
                const page = toPage(response);
                setItems(page.items);
                setNextCursor(page.nextCursor);
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
    }, [path, toPage]);

    async function loadMore() {
        if (!nextCursor) {
            return;
        }

        setLoadingMore(true);
        setError(null);

        try {
            const response = await api<Response>(
                `${path}?before=${encodeURIComponent(nextCursor)}`,
            );
            const page = toPage(response);
            setItems((current) => [...current, ...page.items]);
            setNextCursor(page.nextCursor);
        } catch (err) {
            setError(err);
        } finally {
            setLoadingMore(false);
        }
    }

    return {
        items,
        loading,
        loadingMore,
        hasMore: nextCursor !== null,
        error,
        loadMore,
        prepend: (item) => setItems((current) => [item, ...current]),
        remove: (id) => setItems((current) => current.filter((item) => item._id !== id)),
    };
}
