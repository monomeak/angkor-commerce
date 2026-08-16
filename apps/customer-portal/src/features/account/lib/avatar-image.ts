export const AVATAR_MAX_FILE_BYTES = 5 * 1024 * 1024;

/** Matches core-api's angkor.image.max-width/height, so the server has nothing left to shrink. */
const AVATAR_SIZE = 400;
const AVATAR_QUALITY = 0.85;

export type PreparedAvatar = {
    blob: Blob;
    fileName: string;
};

/**
 * Center-crops and downscales the picked file to a square JPEG before it goes to
 * `PUT /storefront/auth/me/image` — keeps the upload small and the circular frame
 * undistorted regardless of the source aspect ratio.
 */
export async function prepareAvatarFile(file: File): Promise<PreparedAvatar> {
    if (!file.type.startsWith("image/")) {
        throw new Error("Choose an image file.");
    }

    if (file.size > AVATAR_MAX_FILE_BYTES) {
        throw new Error("Image must be smaller than 5 MB.");
    }

    const bitmap = await createImageBitmap(file);

    try {
        const canvas = document.createElement("canvas");
        canvas.width = AVATAR_SIZE;
        canvas.height = AVATAR_SIZE;

        const context = canvas.getContext("2d");

        if (!context) {
            throw new Error("Could not process that image.");
        }

        // JPEG has no alpha channel — paint white so transparent source images
        // don't come out with black corners.
        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, AVATAR_SIZE, AVATAR_SIZE);

        const side = Math.min(bitmap.width, bitmap.height);
        const sourceX = (bitmap.width - side) / 2;
        const sourceY = (bitmap.height - side) / 2;
        context.drawImage(bitmap, sourceX, sourceY, side, side, 0, 0, AVATAR_SIZE, AVATAR_SIZE);

        const blob = await new Promise<Blob | null>((resolve) => {
            canvas.toBlob(resolve, "image/jpeg", AVATAR_QUALITY);
        });

        if (!blob) {
            throw new Error("Could not process that image.");
        }

        return { blob, fileName: "avatar.jpg" };
    } finally {
        bitmap.close();
    }
}

export function getInitials(firstName: string, lastName: string): string {
    return `${firstName.trim().at(0) ?? ""}${lastName.trim().at(0) ?? ""}`.toUpperCase();
}
