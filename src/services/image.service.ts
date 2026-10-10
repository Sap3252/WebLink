import { v2 as cloudinary } from "cloudinary";
import { env } from "../config/env.js";

if (env.cloudinary) {
    cloudinary.config({
        cloud_name: env.cloudinary.cloudName,
        api_key: env.cloudinary.apiKey,
        api_secret: env.cloudinary.apiSecret,
        secure: true,
    });
}

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_FORMATS = "jpg,jpeg,png,webp,gif";
// Applied when the photo is uploaded, so the stored file is already clean:
// - c_limit,w_2000,h_2000: big photos are scaled down (smaller ones are left as they are).
// - fl_force_strip: removes EXIF, IPTC and XMP, where phones save the GPS location.
// - q_auto: re-encodes the image, which also drops metadata fl_force_strip keeps
//   (like PNG text chunks).
const UPLOAD_TRANSFORMATION = "c_limit,w_2000,h_2000,q_auto,fl_force_strip";

export interface UploadedImage {
    publicId: string;
    url: string;
    width: number;
    height: number;
    bytes: number;
}

export function imagesEnabled(): boolean {
    return env.cloudinary !== null;
}

// Each user uploads to their own folder, so a post can only use its author's photos.
export function userImageFolder(userId: string): string {
    return `weblink/posts/${userId}`;
}

// Parameters the browser needs to upload straight to Cloudinary. The signature proves
// they come from our API: the secret never leaves the server, and the browser can't
// change the folder, the formats or the transformation without breaking it.
export function createUploadSignature(userId: string) {
    if (!env.cloudinary) {
        throw new Error("Cloudinary is not configured");
    }

    const params = {
        timestamp: Math.round(Date.now() / 1000),
        folder: userImageFolder(userId),
        allowed_formats: ALLOWED_FORMATS,
        transformation: UPLOAD_TRANSFORMATION,
    };

    return {
        ...params,
        cloudName: env.cloudinary.cloudName,
        apiKey: env.cloudinary.apiKey,
        signature: cloudinary.utils.api_sign_request(params, env.cloudinary.apiSecret),
    };
}

// The image as Cloudinary stored it, or null if there is no image with that id.
export async function findUploadedImage(publicId: string): Promise<UploadedImage | null> {
    try {
        const resource = await cloudinary.api.resource(publicId);

        return {
            publicId: resource.public_id,
            url: resource.secure_url,
            width: resource.width,
            height: resource.height,
            bytes: resource.bytes,
        };
    } catch (error) {
        if ((error as { error?: { http_code?: number } }).error?.http_code === 404) {
            return null;
        }

        throw error;
    }
}

export async function deleteImage(publicId: string): Promise<void> {
    await cloudinary.uploader.destroy(publicId, { invalidate: true });
}
