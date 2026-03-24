/**
 * Helper to upload image files to Cloudinary using an unsigned preset.
 */
/**
 * Helper to upload image files to Cloudinary using an unsigned preset.
 */
export const uploadImage = async (file: File): Promise<string> => {
    const cloudName = "dexaywiyf";
    const uploadPreset = "findmess_upload";

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);

    try {
        const res = await fetch(
            `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
            {
                method: "POST",
                body: formData,
            }
        );

        if (!res.ok) {
            throw new Error('Cloudinary upload failed');
        }

        const data = await res.json();
        return data.secure_url;
    } catch (error) {
        console.error('Cloudinary upload error:', error);
        throw error;
    }
};

// Keep the old name as an alias if needed, or just export both
export const uploadToCloudinary = uploadImage;
