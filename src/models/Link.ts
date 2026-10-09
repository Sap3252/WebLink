import { Schema, model, type Model, type Types } from "mongoose";

// A "link" is WebLink's take on a like: a user connecting with a post.
export interface ILink {
    user: Types.ObjectId;
    post: Types.ObjectId;
    createdAt: Date;
}

const linkSchema = new Schema<ILink>(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: [true, "User is required"],
        },
        post: {
            type: Schema.Types.ObjectId,
            ref: "Post",
            required: [true, "Post is required"],
        },
    },
    {
        timestamps: { createdAt: true, updatedAt: false },
    },
);

linkSchema.index({ post: 1, user: 1 }, { unique: true });

const Link: Model<ILink> = model<ILink>("Link", linkSchema);

export default Link;
