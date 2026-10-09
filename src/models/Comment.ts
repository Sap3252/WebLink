import { Schema, model, type Model, type Types } from "mongoose";

export interface IComment {
    post: Types.ObjectId;
    author: Types.ObjectId;
    text: string;
    createdAt: Date;
    updatedAt: Date;
}

const commentSchema = new Schema<IComment>(
    {
        post: {
            type: Schema.Types.ObjectId,
            ref: "Post",
            required: [true, "Post is required"],
        },
        author: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Author is required"],
        },
        text: {
            type: String,
            required: [true, "Text is required"],
            trim: true,
            maxlength: [250, "Comment cannot exceed 250 characters"],
        },
    },
    {
        timestamps: true,
    },
);

// The comments of a post, newest first: the query every comment list makes.
commentSchema.index({ post: 1, createdAt: -1 });

const Comment: Model<IComment> = model<IComment>("Comment", commentSchema);

export default Comment;
