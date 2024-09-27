import { generateReactHelpers } from "@uploadthing/react/hooks";
import type { OurFileRouter } from "@/app/api/uploadthing/core";

export const { useUploadThing, uploadFiles } = generateReactHelpers<OurFileRouter>();

export const useCustomUploadThing = () => {
    const { startUpload, isUploading, permittedFileInfo } = useUploadThing("media");

    const handleUpload = async (files: File[]) => {
        if (!files.length) return null;

        try {
            const uploadedFiles = await startUpload(files);
            return uploadedFiles?.[0]?.url ?? null;
        } catch (error) {
            console.error("Upload failed:", error);
            return null;
        }
    };

    return { handleUpload, isUploading, permittedFileInfo };
};