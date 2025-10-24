/**
 * Utility functions for handling property images
 */

const PROPERTY_IMAGES_BASE_PATH = "/images/properties/";

/**
 * Check if a string is a valid URL
 * @param string - The string to check
 * @returns boolean indicating if the string is a valid URL
 */
function isValidUrl(string: string): boolean {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

/**
 * Get the full URL for a property image
 * @param filename - The image filename or URL stored in the database
 * @returns Full URL path to the image
 */
export function getPropertyImageUrl(
  filename: string | null | undefined
): string {
  if (!filename) {
    return "/images/placeholder-property.svg"; // Default placeholder
  }

  // If it's already a full URL (Vercel Blob), return as is
  if (isValidUrl(filename)) {
    return filename;
  }

  // Otherwise, treat as local filename
  return `${PROPERTY_IMAGES_BASE_PATH}${filename}`;
}

/**
 * Get URLs for all property images
 * @param images - Array of image filenames
 * @returns Array of full URL paths
 */
export function getPropertyImageUrls(
  images: string[] | null | undefined
): string[] {
  if (!images || images.length === 0) {
    return ["/images/placeholder-property.svg"];
  }
  return images.map((filename) => `${PROPERTY_IMAGES_BASE_PATH}${filename}`);
}

/**
 * Get the primary image URL for a property
 * @param property - Property object with primaryImage and images fields
 * @returns URL for the primary image or first available image
 */
export function getPrimaryImageUrl(property: {
  primaryImage?: string | null;
  images?: string[] | null;
}): string {
  // Use primary image if available
  if (property.primaryImage) {
    return getPropertyImageUrl(property.primaryImage);
  }

  // Fall back to first image in array
  if (property.images && property.images.length > 0) {
    return getPropertyImageUrl(property.images[0]);
  }

  // Default placeholder
  return "/images/placeholder-property.svg";
}

/**
 * Extract filename from a full image path (useful for database storage)
 * @param fullPath - Full path or URL to the image
 * @returns Just the filename
 */
export function extractImageFilename(fullPath: string): string {
  return fullPath.split("/").pop() || "";
}

/**
 * Check if an image URL is stored in Vercel Blob
 * @param url - The image URL to check
 * @returns boolean indicating if it's a Vercel Blob URL
 */
export function isBlobUrl(url: string): boolean {
  return url.startsWith("https://") && url.includes("vercel-storage.com");
}

/**
 * Migrate local images to Vercel Blob (utility for future use)
 * @param localImagePaths - Array of local image paths to migrate
 * @returns Promise resolving to array of new Blob URLs
 */
export async function migrateImagesToBlob(
  localImagePaths: string[]
): Promise<string[]> {
  // This is a placeholder for future migration functionality
  console.log("Image migration not implemented yet:", localImagePaths);
  return localImagePaths;
}
