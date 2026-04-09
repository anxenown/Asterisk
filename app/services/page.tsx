"use client";

import { useEffect, useState, useMemo } from "react";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Service } from "@/types";
import Link from "next/link";
import { Search, MapPin, Star, ArrowRight } from "lucide-react";
import { calculateDistance, getCoordsFromPincode } from "@/lib/location";

const categories = [
  { value: "all", label: "All Services" },
  { value: "plumbing", label: "Plumbing" },
  { value: "electrical", label: "Electrical" },
  { value: "tutoring", label: "Tutoring" },
  { value: "delivery", label: "Delivery" },
  { value: "cleaning", label: "Cleaning" },
];

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [maxPrice, setMaxPrice] = useState(5000);
  const [userPincode, setUserPincode] = useState("");
  const [radiusKm, setRadiusKm] = useState(20);
  const [sortBy, setSortBy] = useState<
    "newest" | "price-low" | "price-high" | "rating"
  >("newest");

  // Fetch Services from Firestore
  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      try {
        let q;

        if (selectedCategory !== "all") {
          q = query(
            collection(db, "services"),
            where("category", "==", selectedCategory),
            orderBy("createdAt", "desc"),
          );
        } else {
          q = query(collection(db, "services"), orderBy("createdAt", "desc"));
        }

        const snapshot = await getDocs(q);
        const data: Service[] = snapshot.docs.map(
          (doc) =>
            ({
              id: doc.id,
              ...doc.data(),
            }) as Service,
        );

        setServices(data);
      } catch (error) {
        console.error("Error fetching services:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, [selectedCategory]);

  // Filtered & Sorted Services
  const filteredServices = useMemo(() => {
    let result = [...services];

    // Search Filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (s) =>
          s.title?.toLowerCase().includes(term) ||
          s.description?.toLowerCase().includes(term),
      );
    }

    // Price Filter
    result = result.filter((s) => s.price <= maxPrice);

    // Location Filter (Pincode + Radius)
    if (userPincode.length === 6) {
      const userCoords = getCoordsFromPincode(userPincode);
      if (userCoords) {
        result = result.filter((service) => {
          const providerCoords = getCoordsFromPincode(service.pincode);
          if (!providerCoords) return false;

          const distance = calculateDistance(
            userCoords.lat,
            userCoords.lng,
            providerCoords.lat,
            providerCoords.lng,
          );
          return distance <= radiusKm;
        });
      }
    }

    // Sorting
    switch (sortBy) {
      case "price-low":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        result.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case "newest":
      default:
        result.sort(
          (a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0),
        );
        break;
    }

    return result;
  }, [services, searchTerm, maxPrice, userPincode, radiusKm, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-5xl font-bold text-gray-900">
          Find Local Services
        </h1>
        <p className="text-xl text-gray-600 mt-2">
          Trusted professionals near you in Lucknow
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-3xl p-8 mb-12 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">
          {/* Search */}
          <div className="lg:col-span-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Services
            </label>
            <div className="relative">
              <Search className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Plumber, tutor, electrician..."
                className="w-full pl-12 py-4 border border-gray-300 rounded-2xl focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          {/* Category */}
          <div className="lg:col-span-3">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full py-4 px-5 border border-gray-300 rounded-2xl focus:outline-none focus:border-orange-500"
            >
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <div className="lg:col-span-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full py-4 px-5 border border-gray-300 rounded-2xl focus:outline-none focus:border-orange-500"
            >
              <option value="newest">Newest First</option>
              <option value="rating">Top Rated</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Price & Location */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="text-sm font-medium text-gray-700">
                Max Price
              </label>
              <span className="font-semibold text-orange-600">₹{maxPrice}</span>
            </div>
            <input
              type="range"
              min="100"
              max="10000"
              step="100"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-orange-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Your Pincode
            </label>
            <div className="flex gap-4">
              <input
                type="text"
                maxLength={6}
                value={userPincode}
                onChange={(e) =>
                  setUserPincode(e.target.value.replace(/\D/g, ""))
                }
                placeholder="226001"
                className="flex-1 py-4 px-5 border border-gray-300 rounded-2xl focus:outline-none focus:border-orange-500"
              />
              <select
                value={radiusKm}
                onChange={(e) => setRadiusKm(Number(e.target.value))}
                className="py-4 px-5 border border-gray-300 rounded-2xl focus:outline-none focus:border-orange-500"
              >
                <option value={5}>5 km</option>
                <option value={10}>10 km</option>
                <option value={20}>20 km</option>
                <option value={50}>50 km</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Results Section */}
      {loading ? (
        <div className="text-center py-24">
          <div className="animate-spin w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full mx-auto mb-6"></div>
          <p className="text-gray-600 text-lg">
            Finding the best services for you...
          </p>
        </div>
      ) : filteredServices.length === 0 ? (
        <div className="text-center py-24">
          <MapPin className="w-20 h-20 text-gray-300 mx-auto mb-6" />
          <h3 className="text-2xl font-semibold mb-2">No services found</h3>
          <p className="text-gray-500">
            Try changing your filters or search term
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredServices.map((service) => {
            const userCoords =
              userPincode.length === 6
                ? getCoordsFromPincode(userPincode)
                : null;
            const providerCoords = getCoordsFromPincode(service.pincode);
            const distance =
              userCoords && providerCoords
                ? calculateDistance(
                    userCoords.lat,
                    userCoords.lng,
                    providerCoords.lat,
                    providerCoords.lng,
                  )
                : null;

            return (
              <div
                key={service.id}
                className="bg-white border border-gray-200 rounded-3xl p-8 hover:shadow-2xl transition-all group"
              >
                <div className="flex justify-between items-start mb-5">
                  <span className="uppercase text-xs font-medium bg-orange-100 text-orange-700 px-4 py-1.5 rounded-full">
                    {service.category}
                  </span>
                  {service.rating && (
                    <div className="flex items-center gap-1 text-sm font-medium">
                      <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                      {service.rating.toFixed(1)}
                    </div>
                  )}
                </div>

                <h3 className="text-2xl font-bold leading-tight mb-4 group-hover:text-orange-600 transition-colors">
                  {service.title}
                </h3>

                <p className="text-gray-600 line-clamp-3 mb-8">
                  {service.description}
                </p>

                <div className="flex justify-between items-end">
                  <div>
                    <div className="text-3xl font-bold text-gray-900">
                      ₹{service.price}
                    </div>
                    <div className="text-sm text-gray-500">
                      /{service.priceType}
                    </div>
                  </div>

                  <Link
                    href={`/book/${service.id}`}
                    className="flex items-center gap-2 bg-black text-white px-8 py-3.5 rounded-2xl hover:bg-orange-600 transition-all font-medium"
                  >
                    Book
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </div>

                {distance && (
                  <div className="mt-6 text-sm text-gray-500 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {distance.toFixed(1)} km away
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
