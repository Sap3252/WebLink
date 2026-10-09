import { Schema, model, type Model, type HydratedDocument, type Types } from "mongoose";

export interface IFollow {
    follower: Types.ObjectId;
    following: Types.ObjectId;
    createdAt: Date;
}

export type FollowDocument = HydratedDocument<IFollow>;

const followSchema = new Schema<IFollow>(
    {
        follower: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Follower is required"],
        },
        following: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Following is required"],
        },
    },
    {
        timestamps: { createdAt: true, updatedAt: false },
    },
);

followSchema.index({ follower: 1, following: 1 }, { unique: true });

followSchema.pre("validate", function () {
    if (this.follower.equals(this.following)) {
        throw new Error("A user cannot follow themselves");
    }
});

const Follow: Model<IFollow> = model<IFollow>("Follow", followSchema);

export default Follow;
