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
