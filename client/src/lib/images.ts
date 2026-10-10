import type { TranslationKey } from "../i18n/translations";
import { api, ApiError } from "./api";

export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
// Same limit the API checks.
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const IMAGE_ALT_MAX_LENGTH = 300;

interface UploadSignature {
    cloudName: string;
    apiKey: string;
    signature: string;
    timestamp: number;
    folder: string;
    allowed_formats: string;
    transformation: string;
}

// Checked before uploading, so the user knows right away. Returns the error to show.
export function validateImageFile(file: File): TranslationKey | null {
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
        return "errors.imageType";
    }

    if (file.size > MAX_IMAGE_BYTES) {
        return "errors.imageTooLarge";
    }

    return null;
}

// Uploads the photo straight to Cloudinary with a signature from our API, and returns
// the id the API needs to attach it to a post.
export async function uploadImage(file: File): Promise<string> {
    const signature = await api<UploadSignature>("/uploads/signature", { method: "POST" });

    const form = new FormData();
    form.append("file", file);
    form.append("api_key", signature.apiKey);
    form.append("signature", signature.signature);
    form.append("timestamp", String(signature.timestamp));
    form.append("folder", signature.folder);
    form.append("allowed_formats", signature.allowed_formats);
    form.append("transformation", signature.transformation);

    const response = await fetch(
        `https://api.cloudinary.com/v1_1/${signature.cloudName}/image/upload`,
        { method: "POST", body: form },
    );

    if (!response.ok) {
        throw new ApiError(response.status, "Upload failed");
    }

    const uploaded = (await response.json()) as { public_id: string };
    return uploaded.public_id;
}

// Cloudinary resizes and converts on the fly from the URL: the right width, and the
// best format and quality for each browser (WebP, AVIF...).
export function imageUrl(url: string, width: number): string {
    return url.replace("/upload/", `/upload/f_auto,q_auto,c_limit,w_${width}/`);
}

const SRCSET_WIDTHS = [600, 1200];

// Versions for `srcset`, so each screen downloads the size it needs. Cloudinary never
// enlarges a photo (c_limit), so no version is announced wider than the original.
export function imageSrcSet(url: string, originalWidth: number): string {
    const widths = [...new Set(SRCSET_WIDTHS.map((width) => Math.min(width, originalWidth)))];
    return widths.map((width) => `${imageUrl(url, width)} ${width}w`).join(", ");
}
