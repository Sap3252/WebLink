import { api } from "../lib/api";
import type { Comment, CommentsPage } from "../lib/types";
import { usePaginatedList, type ListPage, type PaginatedList } from "../lib/usePaginatedList";

export interface CommentsList extends PaginatedList<Comment> {
    deleteComment: (id: string) => Promise<void>;
}

function toCommentsPage(page: CommentsPage): ListPage<Comment> {
    return { items: page.comments, nextCursor: page.nextCursor };
}

export function useComments(postId: string): CommentsList {
    const list = usePaginatedList(`/posts/${postId}/comments`, toCommentsPage);

    return {
        ...list,
        deleteComment: async (id) => {
            await api<void>(`/comments/${id}`, { method: "DELETE" });
            list.remove(id);
        },
    };
}
