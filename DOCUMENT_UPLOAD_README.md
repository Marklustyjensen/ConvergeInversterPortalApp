# Document Upload System

## Overview

The document upload system has been redesigned to provide better organization and integration with Vercel Blob storage. Admin users can now upload files with proper metadata for organized storage and easy access by investors.

## Features

### Admin Document Upload

- **Upload Button**: Clean interface with a dedicated "Upload Files" button
- **Property Selection**: Admins must select which property the document belongs to
- **Date Selection**: Year and month selection for proper document organization
- **Document Type**: Choose between "Financial Document" or "Star Report"
- **File Validation**: 10MB file size limit with proper file type validation
- **Vercel Blob Integration**: Files are stored using Vercel's blob storage service

### Document Organization

Files are organized using the following structure:

```
{property-uuid}/{year}/{month}/{document-type}/{timestamp}-{filename}
```

Example: `550e8400-e29b-41d4-a716-446655440000/2025/01/financial/1703123456789-december-2024-financial-report.pdf`

### Investor Document Access

- **Property Filter**: Investors can filter documents by property
- **Year/Month Organization**: Documents are grouped by year and month
- **Document Types**: Clear distinction between financial documents and star reports
- **Download Links**: Direct download access to all accessible documents

## Database Schema

### Document Model

```prisma
model Document {
  id           String   @id @default(uuid())
  name         String   // Unique filename with timestamp
  originalName String   // Original uploaded filename
  type         String   // MIME type
  size         Int      // File size in bytes
  url          String   // Public download URL
  blobKey      String?  // Vercel blob storage key
  propertyId   String   // Associated property
  property     Property @relation(fields: [propertyId], references: [id], onDelete: Cascade)
  documentType String   // "financial" or "star_report"
  year         Int      // Document year
  month        Int      // Document month (1-12)
  uploadDate   DateTime @default(now())
  uploadedBy   String   // Admin user who uploaded
  uploadedByUser User   @relation(fields: [uploadedBy], references: [id])

  @@index([propertyId, year, month, documentType])
}
```

## Environment Variables

Add the following to your `.env` file:

```bash
# Vercel Blob Storage Configuration
BLOB_READ_WRITE_TOKEN="your-vercel-blob-token-here"
```

Get your Vercel Blob token from: https://vercel.com/dashboard/stores

## API Endpoints

### Admin Endpoints

- `POST /api/admin/documents/upload` - Upload documents with metadata
- `GET /api/admin/documents` - Get all documents (admin view)
- `DELETE /api/admin/documents/[documentId]` - Delete a document

### Investor Endpoints

- `GET /api/documents` - Get documents accessible to the logged-in investor
- Query parameters: `propertyId`, `year`, `month`, `documentType`

## File Upload Process

1. Admin clicks "Upload Files" button
2. File selection dialog opens
3. After file selection, modal appears with metadata form:
   - Property selection (required)
   - Year selection (defaults to current year)
   - Month selection (defaults to current month)
   - Document type selection (Financial or Star Report)
4. Admin clicks "Upload" to submit
5. Files are uploaded to Vercel Blob storage
6. Database records are created with metadata
7. Files become immediately accessible to investors with access to the selected property

## Security

- Only admin users can upload documents
- Investors can only access documents for properties they have access to
- File access is controlled through the user-property relationship
- Blob storage URLs are public but unpredictable (security through obscurity)
- File deletion removes both database record and blob storage file

## Deployment Notes

1. Ensure Vercel Blob storage is configured in your Vercel project
2. Set the `BLOB_READ_WRITE_TOKEN` environment variable
3. Run database migration: `npx prisma migrate deploy`
4. Generate Prisma client: `npx prisma generate`

## Development

For local development without Vercel Blob:

- The system will fall back to placeholder URLs
- Database records are still created for testing
- Set up Vercel Blob storage for full functionality
