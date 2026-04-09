import Link from "next/link";
import { Wrench, Lightbulb, Users, Award, MapPin } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-orange-600 to-orange-700 text-white py-24">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Need help at home?
            <br />
            <span className="text-orange-200">JanSahay hai na!</span>
          </h1>
          <p className="text-xl text-orange-100 max-w-2xl mx-auto">
            Connecting Lucknow residents with trusted local service providers —
            quickly, reliably, and transparently.
          </p>
        </div>
      </div>

      {/* Our Story */}
      <div className="max-w-5xl mx-auto px-6 py-20">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-4xl font-bold mb-6">Our Story</h2>
          <p className="text-lg text-gray-600 leading-relaxed">
            JanSahay was born from a simple frustration — finding reliable help
            for everyday home needs in Lucknow was too difficult,
            time-consuming, and often unreliable.
          </p>
          <p className="text-lg text-gray-600 leading-relaxed mt-6">
            We decided to change that. Our mission is to make quality home
            services accessible to every household in Lucknow by connecting them
            with verified, skilled, and trustworthy local service providers.
          </p>
        </div>

        {/* Values */}
        <div className="grid md:grid-cols-3 gap-10 mt-20">
          <div className="text-center">
            <div className="w-20 h-20 mx-auto bg-orange-100 rounded-2xl flex items-center justify-center mb-6">
              <Users className="w-10 h-10 text-orange-600" />
            </div>
            <h3 className="text-2xl font-semibold mb-3">Trust First</h3>
            <p className="text-gray-600">
              Every provider is verified. We prioritize safety, reliability, and
              transparency above everything else.
            </p>
          </div>

          <div className="text-center">
            <div className="w-20 h-20 mx-auto bg-orange-100 rounded-2xl flex items-center justify-center mb-6">
              <MapPin className="w-10 h-10 text-orange-600" />
            </div>
            <h3 className="text-2xl font-semibold mb-3">Hyper Local</h3>
            <p className="text-gray-600">
              Focused on Lucknow and nearby areas. We connect you with providers
              who understand your locality and speak your language.
            </p>
          </div>

          <div className="text-center">
            <div className="w-20 h-20 mx-auto bg-orange-100 rounded-2xl flex items-center justify-center mb-6">
              <Award className="w-10 h-10 text-orange-600" />
            </div>
            <h3 className="text-2xl font-semibold mb-3">Quality Assured</h3>
            <p className="text-gray-600">
              Real ratings, reviews, and service history. We make sure you get
              the best service every single time.
            </p>
          </div>
        </div>
      </div>

      {/* What We Offer */}
      <div className="bg-white py-20">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-12">
            What We Offer
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="border border-gray-200 rounded-3xl p-10 hover:shadow-lg transition">
              <div className="flex items-center gap-4 mb-6">
                <Wrench className="w-10 h-10 text-orange-600" />
                <h3 className="text-2xl font-semibold">For Customers</h3>
              </div>
              <ul className="space-y-4 text-gray-600">
                <li className="flex gap-3">
                  <span className="text-green-500 mt-1">✓</span>
                  Browse verified local service providers
                </li>
                <li className="flex gap-3">
                  <span className="text-green-500 mt-1">✓</span>
                  Instant booking with transparent pricing
                </li>
                <li className="flex gap-3">
                  <span className="text-green-500 mt-1">✓</span>
                  Real-time chat with providers
                </li>
                <li className="flex gap-3">
                  <span className="text-green-500 mt-1">✓</span>
                  Secure payments &amp; easy tracking
                </li>
              </ul>
            </div>

            <div className="border border-gray-200 rounded-3xl p-10 hover:shadow-lg transition">
              <div className="flex items-center gap-4 mb-6">
                <Lightbulb className="w-10 h-10 text-orange-600" />
                <h3 className="text-2xl font-semibold">
                  For Service Providers
                </h3>
              </div>
              <ul className="space-y-4 text-gray-600">
                <li className="flex gap-3">
                  <span className="text-green-500 mt-1">✓</span>
                  Grow your business with more customers
                </li>
                <li className="flex gap-3">
                  <span className="text-green-500 mt-1">✓</span>
                  Manage bookings and earnings easily
                </li>
                <li className="flex gap-3">
                  <span className="text-green-500 mt-1">✓</span>
                  Build reputation with genuine reviews
                </li>
                <li className="flex gap-3">
                  <span className="text-green-500 mt-1">✓</span>
                  Get paid securely and on time
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="bg-orange-600 text-white py-20 text-center">
        <div className="max-w-2xl mx-auto px-6">
          <h2 className="text-4xl font-bold mb-6">
            Ready to experience hassle-free home services?
          </h2>
          <p className="text-xl text-orange-100 mb-10">
            Join thousands of Lucknow families who trust JanSahay
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/services"
              className="bg-white text-orange-600 px-10 py-4 rounded-2xl font-semibold text-lg hover:bg-gray-100 transition"
            >
              Browse Services
            </Link>
            <Link
              href="/login"
              className="border-2 border-white px-10 py-4 rounded-2xl font-semibold text-lg hover:bg-white/10 transition"
            >
              Join as a Provider
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
