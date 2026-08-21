import {Schema, model, type Model, type HydratedDocument, type Types} from 'mongoose';

export interface IPost {
  text: string;
  author: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export type PostDocument = HydratedDocument<IPost>;

const postSchema = new Schema<IPost>({
    text:{
        type: String,
        required: [true, "Text is required"],
        trim: true,
        maxlength: [250, "Text cannot exceed 250 characters"]
    },
    author:{
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, "Author is required"]
    }
}, {
    timestamps: true
});

postSchema.index({ author: 1, createdAt: -1 });

const Post: Model<IPost> = model<IPost>(
    "Post",
    postSchema
);

export default Post;
