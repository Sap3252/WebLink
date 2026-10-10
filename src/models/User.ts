import { Schema, model, type Model, type HydratedDocument } from "mongoose";

export interface IUser {
    username: string;
    email: string;
    passwordHash: string;
    bio: string;
    createdAt: Date;
    updatedAt: Date;
}

export type UserDocument = HydratedDocument<IUser>;

export const PUBLIC_USER_FIELDS = "username bio";

export const USERNAME_MAX_LENGTH = 30;

const userSchema = new Schema<IUser>(
    {
        username: {
            type: String,
            required: [true, "Username is required"],
            unique: true,
            trim: true,
            maxlength: [
                USERNAME_MAX_LENGTH,
                `Username cannot exceed ${USERNAME_MAX_LENGTH} characters`,
            ],
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            trim: true,
            lowercase: true,
            match: [/.+\@.+\..+/, "Please fill a valid email address"],
        },
        passwordHash: {
            type: String,
            required: [true, "Password is required"],
            select: false,
        },
        bio: {
            type: String,
            default: "",
            maxlength: [100, "Bio cannot exceed 100 characters"],
        },
    },
    {
        timestamps: true,
        toJSON: {
            transform(_doc, ret) {
                const { passwordHash, ...rest } = ret;
                return rest;
            },
        },
    },
);

const User: Model<IUser> = model<IUser>("User", userSchema);

export default User;
