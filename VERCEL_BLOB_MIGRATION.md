# Vercel Blob Image Storage Migration

## Overview

The investor portal has been updated to use Vercel Blob storage for property images instead of storing them in the public folder. This provides better scalability, performance, and management of images.

## Changes Made

### 1. Updated Image Utilities (`lib/imageUtils.ts`)

- Added support for both local image paths (backward compatibility) and Vercel Blob URLs
- New functions:
  - `isValidUrl()` - Checks if a string is a valid URL
  - `isBlobUrl()` - Identifies Vercel Blob URLs
  - `migrateImagesToBlob()` - Placeholder for future migration

### 2. Created Blob Utilities (`lib/blobUtils.ts`)

- `uploadToBlob()` - Handles file uploads to Vercel Blob storage
- `deleteFromBlob()` - Placeholder for future deletion functionality
- Automatic error handling for missing environment variables

### 3. Updated Property Creation Form (`components/adminComponents/adminPropertiesTab.tsx`)

- Added optional image upload field
- Updated form to use FormData instead of JSON
- Enhanced TypeScript interfaces to include image file handling

### 4. Updated Properties API (`app/api/admin/properties/route.ts`)

- Converted from JavaScript to TypeScript
- Added support for multipart/form-data requests
- Integrated Vercel Blob upload functionality
- Sets both `primaryImage` and `images` array when an image is uploaded

## Setup Requirements

### Environment Variables

Add the following to your `.env.local` file:

```bash
BLOB_READ_WRITE_TOKEN="your-vercel-blob-token-here"
```

To get your Vercel Blob token:

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Navigate to Storage → Blob
3. Create a new store or use an existing one
4. Copy the read-write token from the settings

### Vercel Deployment

When deploying to Vercel, ensure the `BLOB_READ_WRITE_TOKEN` environment variable is set in your project settings.

## Usage

### Creating Properties with Images

1. Navigate to the Admin Dashboard → Properties tab
2. Click "Add New Property"
3. Fill in all required property details
4. Optionally select an image file (JPG, PNG, GIF supported)
5. Click "Create Property"

The image will be automatically uploaded to Vercel Blob and the property will be created with the image URL.

### Backward Compatibility

- Existing properties with local image paths will continue to work
- The system automatically detects whether an image URL is local or a Blob URL
- No migration is required immediately, but you can gradually replace local images with Blob storage

## File Organization

Images in Vercel Blob are organized under the `properties/` folder with the naming convention:

```
properties/{PROPERTY_CODE}-{TIMESTAMP}-{ORIGINAL_FILENAME}
```

Example: `properties/PROP001-1640995200000-house-front.jpg`

## Error Handling

- If the Blob token is not configured, the API will return a clear error message
- Failed uploads are handled gracefully with appropriate error responses
- Form validation ensures required fields are provided

## Future Enhancements

1. **Bulk Image Upload**: Support for multiple images per property
2. **Image Migration Tool**: Automated migration of existing local images to Blob storage
3. **Image Deletion**: Automatic cleanup when properties are deleted
4. **Image Optimization**: Automatic resizing and compression
5. **Image Gallery Management**: Admin interface for managing property images

## Testing

To test the implementation:

1. Ensure your `.env.local` has the correct `BLOB_READ_WRITE_TOKEN`
2. Start the development server: `npm run dev`
3. Navigate to the admin dashboard
4. Try creating a new property with and without an image
5. Verify images display correctly in the property listings
