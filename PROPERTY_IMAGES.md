# Property Images System

This document explains how the property images system works in your investor portal application.

## Overview

The property images are now stored as references in the database and linked to image files in the `public/images/properties/` folder. Each property can have:

- `primaryImage`: The main image filename for the property
- `images`: An array of image filenames for the property

## Database Schema

```prisma
model Property {
  id          String   @id @default(uuid())
  name        String
  address     String
  city        String
  state       String
  zip         String
  code        String   @unique

  // Image fields
  primaryImage String?  // Main property image filename
  images       String[] // Array of image filenames

  // Many-to-many relationship through UserProperty
  userProperties UserProperty[]
}
```

## File Structure

```
public/
  images/
    properties/
      Courtyard Sherman - Sherman, TX.webp
      Fairfield Inn & Suites by Marriott - Aurora, CO.webp
      Fairfield Inn & Suites by Marriott - Des Moines, IA.webp
      La Posada Lodge & Casitas - Tucson, AZ.webp
    placeholder-property.svg  // Default placeholder
```

## Usage

### 1. Image Utility Functions

Use the utility functions in `lib/imageUtils.ts`:

```typescript
import { getPrimaryImageUrl, getPropertyImageUrls } from "../lib/imageUtils";

// Get primary image URL
const primaryImageUrl = getPrimaryImageUrl(property);

// Get all image URLs
const allImageUrls = getPropertyImageUrls(property.images);
```

### 2. Property Card Component

The `PropertyCard` component automatically uses the primary image:

```tsx
import PropertyCard from "../components/investorComponents/propertyCard";

<PropertyCard property={property} />;
```

### 3. Property Image Gallery

For displaying multiple images with navigation:

```tsx
import PropertyImageGallery from "../components/investorComponents/PropertyImageGallery";

<PropertyImageGallery
  property={property}
  showThumbnails={true}
  className="w-full max-w-4xl"
/>;
```

## Adding New Property Images

### Method 1: Direct Database Update

```javascript
await prisma.property.update({
  where: { id: propertyId },
  data: {
    primaryImage: "new-property-image.jpg",
    images: ["new-property-image.jpg", "additional-image.jpg"],
  },
});
```

### Method 2: Update Seed File

Add the image filenames to `prisma/seed.js`:

```javascript
{
  name: "New Property",
  address: "123 Main St",
  city: "City",
  state: "ST",
  zip: "12345",
  code: "NEWPROP",
  primaryImage: "new-property-main.jpg",
  images: ["new-property-main.jpg", "new-property-alt.jpg"],
}
```

## File Naming Convention

- Use descriptive filenames that match the property name
- Include location information in the filename
- Use web-optimized formats (.webp, .jpg, .png)
- Example: `"Fairfield Inn & Suites by Marriott - Aurora, CO.webp"`

## Image Optimization

- Store images in `public/images/properties/`
- Use Next.js Image component for automatic optimization
- Consider multiple formats (webp for modern browsers, jpg fallback)
- Recommended sizes: 800x600 for main images, 80x80 for thumbnails

## Error Handling

- Missing images fallback to `placeholder-property.svg`
- Utility functions handle null/undefined values gracefully
- Database allows nullable image fields

## Migration

If you need to migrate existing properties to use images:

1. Add image files to `public/images/properties/`
2. Run: `npx prisma migrate dev --name add_property_images`
3. Update database with image filenames
4. Run: `node prisma/seed.js` to populate with sample data

## API Integration

The properties API (`/api/properties`) automatically includes image fields when fetching properties. No additional changes needed to existing API calls.
