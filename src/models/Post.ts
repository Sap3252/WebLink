import { Schema, model, type Model, type HydratedDocument, type Types } from "mongoose";

export interface IPost {
    // Removed when the post is deleted.
    text?: string;
    author: Types.ObjectId;
    linksCount: number;
    commentsCount: number;
    // Soft delete: the post stays so its conversation keeps a place, but it's hidden
    // from every list and its content is gone. null while the post is active.
    deletedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}

export type PostDocument = HydratedDocument<IPost>;

// Filter for posts that haven't been deleted. Also matches posts created before the
// deletedAt field existed, because { field: null } matches a missing field too.
export const ACTIVE_POST = { deletedAt: null };

const postSchema = new Schema<IPost>(
    {
        text: {
            type: String,
            required: [
                function (this: IPost) {
                    return this.deletedAt === null;
                },
                "Text is required",
            ],
            trim: true,
            maxlength: [250, "Text cannot exceed 250 characters"],
        },
        author: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Author is required"],
        },
        // Counters kept in sync on every link/unlink and comment/delete,
        // so lists don't have to count them.
        linksCount: {
            type: Number,
            default: 0,
            min: 0,
        },
        commentsCount: {
            type: Number,
            default: 0,
            min: 0,
        },
        deletedAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    },
);

postSchema.index({ author: 1, createdAt: -1 });

const Post: Model<IPost> = model<IPost>("Post", postSchema);

export default Post;
