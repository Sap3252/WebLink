import type { QueryFilter } from "mongoose";
import Post, { type IPost } from "../models/Post.js";
import { PUBLIC_USER_FIELDS } from "../models/User.js";
import { nextCursorOf, type CursorParams } from "../utils/pagination.js";

export async function findPostsPage(filter: QueryFilter<IPost>, page: CursorParams) {
    const pageFilter: QueryFilter<IPost> = { ...filter };

    if (page.cursor) {
        pageFilter.createdAt = { $lt: page.cursor };
    }

    const posts = await Post.find(pageFilter)
        .sort({ createdAt: -1 })
        .limit(page.limit)
        .populate("author", PUBLIC_USER_FIELDS);

    return { posts, nextCursor: nextCursorOf(posts, page.limit) };
}
