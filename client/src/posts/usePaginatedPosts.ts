import { api } from "../lib/api";
import type { Post, PostsPage } from "../lib/types";
import { usePaginatedList, type ListPage } from "../lib/usePaginatedList";

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

function toPostsPage(page: PostsPage): ListPage<Post> {
    return { items: page.posts, nextCursor: page.nextCursor };
}

// A paginated post list: the feed, all posts or a user's posts.
export function usePaginatedPosts(path: string): PaginatedPosts {
    const list = usePaginatedList(path, toPostsPage);

    return {
        posts: list.items,
        loading: list.loading,
        loadingMore: list.loadingMore,
        hasMore: list.hasMore,
        error: list.error,
        loadMore: list.loadMore,
        addPost: list.prepend,
        deletePost: async (id) => {
            await api<void>(`/posts/${id}`, { method: "DELETE" });
            list.remove(id);
        },
    };
}
