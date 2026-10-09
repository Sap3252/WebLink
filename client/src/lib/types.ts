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

export interface Post {
    _id: string;
    text: string;
    author: PublicUser;
    createdAt: string;
    updatedAt: string;
}

export interface PostsPage {
    posts: Post[];
    nextCursor: string | null;
}

export interface Profile extends User {
    followers: number;
    following: number;
    isFollowing: boolean | null;
}
