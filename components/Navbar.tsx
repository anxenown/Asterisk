"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { LogOut, User, Menu } from "lucide-react";
import Notifications from "@/components/Notifications";
import { useState } from "react";

export default function Navbar() {
  const { user, signOut } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isProvider = user?.role === "provider";

  return (
    <nav className="bg-white border-b sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link
            href="/"
            className="text-3xl font-bold text-orange-600 tracking-tight"
          >
            JanSahay
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {user ? (
              <div className="flex items-center gap-6">
                {/* Dashboard Link */}
                <Link
                  href={
                    isProvider ? "/dashboard/provider" : "/dashboard/customer"
                  }
                  className="flex items-center gap-2 hover:text-orange-600 transition-colors"
                >
                  <User className="w-5 h-5" />
                  <span className="font-medium">
                    {user.name?.split(" ")[0]}
                  </span>
                </Link>
                <Link
                  href="/services"
                  className="py-2 hover:text-orange-600 font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Services
                </Link>
                <Link
                  href="/about"
                  className="py-2 hover:text-orange-600 font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  About
                </Link>
                {/* Provider-specific links */}
                {isProvider && (
                  <>
                    <Link
                      href="/dashboard/provider/services"
                      className="hover:text-orange-600 transition-colors font-medium"
                    >
                      My Services
                    </Link>
                    <Link
                      href="/dashboard/provider/bookings"
                      className="hover:text-orange-600 transition-colors font-medium"
                    >
                      My Bookings
                    </Link>
                  </>
                )}

                {/* Notifications */}
                <Notifications />

                {/* Logout Button */}
                <button
                  onClick={signOut}
                  className="flex items-center gap-2 text-red-600 hover:text-red-700 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2.5 rounded-full font-medium transition-all active:scale-95"
              >
                Login / Signup
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pt-4 border-t flex flex-col gap-4">
            {user && (
              <>
                <Link
                  href={
                    isProvider ? "/dashboard/provider" : "/dashboard/customer"
                  }
                  className="py-2 hover:text-orange-600"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  href="/services"
                  className="py-2 hover:text-orange-600 font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Services
                </Link>
                <Link
                  href="/about"
                  className="py-2 hover:text-orange-600 font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  About
                </Link>
                {isProvider && (
                  <>
                    <Link
                      href="/dashboard/provider/services"
                      className="py-2 hover:text-orange-600"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      My Services
                    </Link>
                    <Link
                      href="/dashboard/provider/bookings"
                      className="py-2 hover:text-orange-600"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      My Bookings
                    </Link>
                  </>
                )}

                <button
                  onClick={() => {
                    signOut();
                    setIsMobileMenuOpen(false);
                  }}
                  className="py-2 text-red-600 text-left flex items-center gap-2"
                >
                  <LogOut className="w-5 h-5" />
                  Logout
                </button>
              </>
            )}

            {!user && (
              <Link
                href="/login"
                className="bg-orange-600 text-white py-3 rounded-full text-center font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Login / Signup
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
