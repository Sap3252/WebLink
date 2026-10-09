import type { QueryFilter } from "mongoose";
import Link from "../models/Link.js";
import Post, { ACTIVE_POST, type IPost, type PostDocument } from "../models/Post.js";
import { PUBLIC_USER_FIELDS } from "../models/User.js";
import { createdBefore, nextCursorOf, type CursorParams } from "../utils/pagination.js";

// Adds `linkedByMe` to each post: whether the viewer gave it a link (false for guests).
export async function withLinkedByMe(posts: PostDocument[], viewerId: string | undefined) {
    const linkedPostIds = new Set<string>();

    if (viewerId && posts.length > 0) {
        const links = await Link.find({
            user: viewerId,
            post: { $in: posts.map((post) => post._id) },
        })
            .select("post")
            .lean();

        for (const link of links) {
            linkedPostIds.add(link.post.toString());
        }
    }

    return posts.map((post) => ({
        ...post.toJSON(),
        linkedByMe: linkedPostIds.has(post._id.toString()),
    }));
}

export async function findPostsPage(
    filter: QueryFilter<IPost>,
    page: CursorParams,
    viewerId: string | undefined,
) {
    const posts = await Post.find({ ...filter, ...ACTIVE_POST, ...createdBefore(page) })
        .sort({ createdAt: -1 })
        .limit(page.limit)
        .populate("author", PUBLIC_USER_FIELDS);

    return {
        posts: await withLinkedByMe(posts, viewerId),
        nextCursor: nextCursorOf(posts, page.limit),
    };
}
