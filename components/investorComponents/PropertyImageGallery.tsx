import Image from "next/image";
import { useState } from "react";
import { getPropertyImageUrls, getPrimaryImageUrl } from "../../lib/imageUtils";
import { Property } from "../../types/property";

interface PropertyImageGalleryProps {
  property: Property;
  className?: string;
  showThumbnails?: boolean;
}

export default function PropertyImageGallery({
  property,
  className = "",
  showThumbnails = false,
}: PropertyImageGalleryProps) {
  const imageUrls = getPropertyImageUrls(property.images);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const currentImageUrl =
    imageUrls[currentImageIndex] || getPrimaryImageUrl(property);

  return (
    <div className={`property-image-gallery ${className}`}>
      {/* Main Image */}
      <div className="main-image relative">
        <Image
          src={currentImageUrl}
          alt={property.name}
          width={800}
          height={600}
          className="w-full h-auto object-cover rounded-lg"
        />

        {/* Navigation arrows for multiple images */}
        {imageUrls.length > 1 && (
          <>
            <button
              onClick={() =>
                setCurrentImageIndex(Math.max(0, currentImageIndex - 1))
              }
              disabled={currentImageIndex === 0}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full disabled:opacity-30 hover:bg-opacity-70"
            >
              ←
            </button>
            <button
              onClick={() =>
                setCurrentImageIndex(
                  Math.min(imageUrls.length - 1, currentImageIndex + 1)
                )
              }
              disabled={currentImageIndex === imageUrls.length - 1}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full disabled:opacity-30 hover:bg-opacity-70"
            >
              →
            </button>

            {/* Image counter */}
            <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
              {currentImageIndex + 1} / {imageUrls.length}
            </div>
          </>
        )}
      </div>

      {/* Thumbnail strip */}
      {showThumbnails && imageUrls.length > 1 && (
        <div className="thumbnail-strip flex gap-2 mt-4 overflow-x-auto">
          {imageUrls.map((url, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`flex-shrink-0 w-20 h-20 overflow-hidden rounded border-2 ${
                currentImageIndex === index
                  ? "border-blue-500"
                  : "border-gray-200"
              }`}
            >
              <Image
                src={url}
                alt={`${property.name} - Image ${index + 1}`}
                width={80}
                height={80}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
