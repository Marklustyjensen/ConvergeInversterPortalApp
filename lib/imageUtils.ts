/**
 * Utility functions for handling property images
 */

const PROPERTY_IMAGES_BASE_PATH = "/images/properties/";

/**
 * Get the full URL for a property image
 * @param filename - The image filename stored in the database
 * @returns Full URL path to the image
 */
export function getPropertyImageUrl(
  filename: string | null | undefined
): string {
  if (!filename) {
    return "/images/placeholder-property.svg"; // Default placeholder
  }
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
