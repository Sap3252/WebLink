import { Schema, model, type Model, type HydratedDocument, type Types } from "mongoose";

export const POST_TEXT_MAX_LENGTH = 250;
export const IMAGE_ALT_MAX_LENGTH = 300;

// A photo stored in Cloudinary. width and height let the client reserve its space
// before it loads, so the page doesn't jump.
export interface IPostImage {
    publicId: string;
    url: string;
    width: number;
    height: number;
    // Description read by screen readers. Empty when the author didn't write one.
    alt: string;
}

export interface IPost {
    // Optional when the post has a photo. Removed when the post is deleted.
    text?: string;
    image: IPostImage | null;
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

const postImageSchema = new Schema<IPostImage>(
    {
        publicId: { type: String, required: true },
        url: { type: String, required: true },
        width: { type: Number, required: true },
        height: { type: Number, required: true },
        alt: {
            type: String,
            default: "",
            trim: true,
            maxlength: [
                IMAGE_ALT_MAX_LENGTH,
                `Image description cannot exceed ${IMAGE_ALT_MAX_LENGTH} characters`,
            ],
        },
    },
    { _id: false },
);

const postSchema = new Schema<IPost>(
    {
        text: {
            type: String,
            // An active post needs text, unless it has a photo.
            required: [
                function (this: IPost) {
                    return this.deletedAt === null && !this.image;
                },
                "Text is required",
            ],
            trim: true,
            maxlength: [
                POST_TEXT_MAX_LENGTH,
                `Text cannot exceed ${POST_TEXT_MAX_LENGTH} characters`,
            ],
        },
        image: {
            type: postImageSchema,
            default: null,
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
// "All posts": active posts (deletedAt null), newest first, without sorting in memory.
postSchema.index({ deletedAt: 1, createdAt: -1 });
// A photo belongs to a single post. Posts without a photo are left out of the index.
postSchema.index(
    { "image.publicId": 1 },
    { unique: true, partialFilterExpression: { "image.publicId": { $exists: true } } },
);

const Post: Model<IPost> = model<IPost>("Post", postSchema);

export default Post;
