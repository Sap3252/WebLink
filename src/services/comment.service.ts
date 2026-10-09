import Comment from "../models/Comment.js";
import { PUBLIC_USER_FIELDS } from "../models/User.js";
import { createdBefore, nextCursorOf, type CursorParams } from "../utils/pagination.js";

export async function findCommentsPage(postId: string, page: CursorParams) {
    const comments = await Comment.find({ post: postId, ...createdBefore(page) })
        .sort({ createdAt: -1 })
        .limit(page.limit)
        .populate("author", PUBLIC_USER_FIELDS);

    return { comments, nextCursor: nextCursorOf(comments, page.limit) };
}
