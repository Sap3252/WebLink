export interface User {
    _id: string;
    username: string;
    email?: string;
    bio: string;
    createdAt: string;
    updatedAt: string;
}

export interface AuthResponse {
    token: string;
    user: User;
}

export interface PublicUser {
    _id: string;
    username: string;
    bio: string;
}

export interface PostImage {
    publicId: string;
    url: string;
    width: number;
    height: number;
    alt: string;
}

export interface Post {
    _id: string;
    // A post can have only a photo, so the text may be missing.
    text?: string;
    image: PostImage | null;
    author: PublicUser;
    linksCount: number;
    linkedByMe: boolean;
    commentsCount: number;
    createdAt: string;
    updatedAt: string;
}

// What GET /posts/:id returns for a deleted post: no text, no author.
export interface DeletedPost {
    _id: string;
    deleted: true;
    commentsCount: number;
    createdAt: string;
    deletedAt: string;
}

export interface Comment {
    _id: string;
    post: string;
    author: PublicUser;
    text: string;
    createdAt: string;
}

export interface CommentsPage {
    comments: Comment[];
    nextCursor: string | null;
}

export interface LinkResult {
    linksCount: number;
    linkedByMe: boolean;
}

export interface PostsPage {
    posts: Post[];
    nextCursor: string | null;
}

export interface Profile extends PublicUser {
    createdAt: string;
    followers: number;
    following: number;
    isFollowing: boolean | null;
}
