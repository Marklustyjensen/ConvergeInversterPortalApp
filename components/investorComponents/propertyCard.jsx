import Link from "next/link";
import Image from "next/image";

export default function PropertyCard() {
  // Array of available property images
  const propertyImages = [
    "Courtyard Sherman - Sherman, TX.webp",
    "Fairfield Inn & Suites by Marriott - Aurora, CO.webp",
    "Fairfield Inn & Suites by Marriott - Des Moines, IA.webp",
    "La Posada Lodge & Casitas - Tucson, AZ.webp",
  ];

  // Get a random image
  const randomImage =
    propertyImages[Math.floor(Math.random() * propertyImages.length)];

  return (
    <>
      <Link href="#" className="block">
        <div className="border border-slate-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
          <div className="flex h-40">
            {/* Property Image */}
            <div className="w-48 flex-shrink-0 rounded-xl overflow-hidden">
              <Image
                src={`/images/properties/${randomImage}`}
                alt="Property Image"
                width={192}
                height={160}
                className="w-full h-full object-contain rounded-l-xl"
              />
            </div>

            {/* Property Details */}
            <div className="flex-1 p-6">
              <h4 className="text-lg font-semibold text-slate-800 mb-2">
                Property Name Placeholder
              </h4>
              <div className="space-y-1 text-slate-600">
                <p className="text-sm">123 Main Street</p>
                <p className="text-sm">City, State 12345</p>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </>
  );
}
