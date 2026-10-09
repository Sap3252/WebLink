import { useEffect, useState } from "react";
import { api } from "../lib/api";
import type { Post, PostsPage } from "../lib/types";

export interface PaginatedPosts {
    posts: Post[];
    loading: boolean;
    loadingMore: boolean;
    hasMore: boolean;
    error: unknown;
    loadMore: () => Promise<void>;
    addPost: (post: Post) => void;
    deletePost: (id: string) => Promise<void>;
}

// Loads a paginated post list (feed, all posts, a user's posts) and keeps the cursor.
// To switch to another list, give the component a new `key` so the state starts fresh.
export function usePaginatedPosts(path: string): PaginatedPosts {
    const [posts, setPosts] = useState<Post[]>([]);
    const [nextCursor, setNextCursor] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState<unknown>(null);

    useEffect(() => {
        let cancelled = false;

        api<PostsPage>(path)
            .then((page) => {
                if (cancelled) return;
                setPosts(page.posts);
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
    }, [path]);

    async function loadMore() {
        if (!nextCursor) {
            return;
        }

        setLoadingMore(true);
        setError(null);

        try {
            const page = await api<PostsPage>(`${path}?before=${encodeURIComponent(nextCursor)}`);
            setPosts((current) => [...current, ...page.posts]);
            setNextCursor(page.nextCursor);
        } catch (err) {
            setError(err);
        } finally {
            setLoadingMore(false);
        }
    }

    function addPost(post: Post) {
        setPosts((current) => [post, ...current]);
    }

    async function deletePost(id: string) {
        await api<void>(`/posts/${id}`, { method: "DELETE" });
        setPosts((current) => current.filter((post) => post._id !== id));
    }

    return {
        posts,
        loading,
        loadingMore,
        hasMore: nextCursor !== null,
        error,
        loadMore,
        addPost,
        deletePost,
    };
}
