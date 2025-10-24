import { put } from "@vercel/blob";

/**
 * Upload a file to Vercel Blob storage
 * @param file - The file to upload
 * @param filename - The desired filename (optional)
 * @returns Promise resolving to the blob URL
 */
export async function uploadToBlob(
  file: File,
  filename?: string
): Promise<string> {
  // Check if Vercel Blob token is configured
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error(
      "BLOB_READ_WRITE_TOKEN environment variable is not configured"
    );
  }

  // Generate filename if not provided
  const finalFilename = filename || `${Date.now()}-${file.name}`;

  // Upload to Vercel Blob
  const blob = await put(`properties/${finalFilename}`, file, {
    access: "public",
  });

  return blob.url;
}

/**
 * Delete a file from Vercel Blob storage
 * @param url - The blob URL to delete
 * @returns Promise resolving when deletion is complete
 */
export async function deleteFromBlob(url: string): Promise<void> {
  // Note: Vercel Blob doesn't have a delete API in the current version
  // This is a placeholder for future implementation
  console.warn("Blob deletion not implemented yet:", url);
}
