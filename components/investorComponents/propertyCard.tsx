import Link from "next/link";
import Image from "next/image";
import { Property } from "../../types/property";
import { getPrimaryImageUrl } from "../../lib/imageUtils";

interface PropertyCardProps {
  property?: Property;
}

export default function PropertyCard({ property }: PropertyCardProps) {
  // Get the primary image URL for this property
  const imageUrl = property
    ? getPrimaryImageUrl(property)
    : "/images/placeholder-property.svg";

  return (
    <>
      <Link href="#" className="block">
        <div className="border border-slate-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
          <div className="flex h-40">
            {/* Property Image */}
            <div className="w-48 flex-shrink-0 rounded-xl overflow-hidden">
              <Image
                src={imageUrl}
                alt={property?.name || "Property Image"}
                width={192}
                height={160}
                className="w-full h-full object-contain rounded-l-xl"
              />
            </div>

            {/* Property Details */}
            <div className="flex-1 p-6">
              <h4 className="text-lg font-semibold text-slate-800 mb-2">
                {property?.name || "Property Name Placeholder"}
              </h4>
              <div className="space-y-1 text-slate-600">
                <p className="text-sm">
                  {property?.address || "123 Main Street"}
                </p>
                <p className="text-sm">
                  {property?.city && property?.state && property?.zip
                    ? `${property.city}, ${property.state} ${property.zip}`
                    : "City, State 12345"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </>
  );
}
