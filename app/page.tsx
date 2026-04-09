"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Wrench, Lightbulb, BookOpen, Truck, ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const categories = [
  { name: "Plumbing",    icon: Wrench,   color: "from-blue-600 to-blue-500",    description: "Leakage, installation & repairs" },
  { name: "Electrical",  icon: Lightbulb, color: "from-amber-600 to-yellow-500", description: "Wiring, fans & inverters" },
  { name: "Tutoring",    icon: BookOpen, color: "from-emerald-600 to-green-500", description: "Maths, Science & English" },
  { name: "Delivery",    icon: Truck,    color: "from-purple-600 to-violet-500", description: "Same-day parcel delivery" },
];

export default function Home() {
  const router = useRouter();
  const { user } = useAuth();

  const handleBrowseServices = () => {
    if (!user) {
      // Redirect to login with callback to services
      router.push("/login?redirect=/services");
    } else {
      router.push("/services");
    }
  };

  const handleJoinProvider = () => {
    if (!user) {
      // Redirect to login with callback to provider signup
      router.push("/login?redirect=/signup");
    } else if (user.role === "provider") {
      router.push("/dashboard/provider");
    } else {
      // Customer trying to become provider - go to signup
      router.push("/signup");
    }
  };

  const handleCategoryClick = (categoryName: string) => {
    if (!user) {
      // Redirect to login with callback to services
      router.push(`/login?redirect=/services?category=${categoryName.toLowerCase()}`);
    } else {
      router.push(`/services?category=${categoryName.toLowerCase()}`);
    }
  };
  return (
    <>
      {/* Hero Section */}
      <div className="hero-bg h-screen flex items-center relative overflow-hidden">
        <div className="absolute inset-0 bg-black/65" />

        <div className="max-w-5xl mx-auto text-center px-6 relative z-10">
          <h1 className="text-6xl md:text-7xl font-bold leading-tight mb-6 text-white">
            Need help at home?<br />
            <span className="text-orange-400">JanSahay hai na!</span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-200 mb-12 max-w-2xl mx-auto">
            Trusted local service providers in Lucknow.<br />
            Book plumbers, electricians, tutors & more in minutes.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleBrowseServices}
              className="bg-orange-600 hover:bg-orange-700 text-white px-10 py-4 rounded-2xl text-xl font-semibold transition-all active:scale-95 flex items-center justify-center gap-3 group"
            >
              Browse Services
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={handleJoinProvider}
              className="border-2 border-white text-white hover:bg-white hover:text-black px-10 py-4 rounded-2xl text-xl font-semibold transition-all"
            >
              Join as a Provider
            </button>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/70 flex flex-col items-center gap-1">
          <span className="text-sm">Scroll to explore</span>
          <div className="w-px h-10 bg-white/40" />
        </div>
      </div>

      {/* Categories Section */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Popular Services</h2>
          <p className="text-gray-600 text-lg max-w-md mx-auto">
            Choose from trusted local professionals across multiple categories
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.name}
                onClick={() => handleCategoryClick(cat.name)}
                className="group text-left"
              >
                <div className={`bg-gradient-to-br ${cat.color} text-white p-10 rounded-3xl h-full flex flex-col transition-all duration-300 hover:scale-[1.04] hover:shadow-2xl`}>
                  <div className="mb-8">
                    <Icon className="w-20 h-20 opacity-90 group-hover:scale-110 transition-transform" />
                  </div>
                  <h3 className="text-3xl font-semibold mb-3">{cat.name}</h3>
                  <p className="text-white/80 text-[17px] leading-relaxed flex-1">
                    {cat.description}
                  </p>

                  <div className="mt-8 flex items-center text-white/90 font-medium group-hover:gap-3 transition-all">
                    Explore
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}