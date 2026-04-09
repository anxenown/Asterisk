"use client";

import { useEffect, useState } from "react";
import { collection, query, where, getDocs, orderBy, doc, getDoc, onSnapshot, Query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { Booking, Service } from "@/types";
import Link from "next/link";
import { Calendar, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

export default function CustomerDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [myBookings, setMyBookings] = useState<(Booking & { service?: Service })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== "customer") {
      router.push("/login");
      return;
    }

    // Store service cache to avoid redundant fetches
    const serviceCache = new Map<string, Service>();

    // Set up real-time listener for customer bookings
    const q = query(
      collection(db, "bookings"),
      where("customerId", "==", user.uid)
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const bookingsData: (Booking & { service?: Service })[] = [];

      for (const docSnap of snapshot.docs) {
        const bookingData = { id: docSnap.id, ...docSnap.data() } as Booking;
        
        // Try to get from cache first
        if (serviceCache.has(bookingData.serviceId)) {
          bookingsData.push({ ...bookingData, service: serviceCache.get(bookingData.serviceId) });
        } else {
          // Fetch service details
          try {
            const serviceDoc = await getDoc(doc(db, "services", bookingData.serviceId));
            if (serviceDoc.exists()) {
              const serviceData = { id: serviceDoc.id, ...serviceDoc.data() } as Service;
              serviceCache.set(bookingData.serviceId, serviceData);
              bookingsData.push({ ...bookingData, service: serviceData });
            } else {
              bookingsData.push(bookingData);
            }
          } catch (error) {
            console.error("Error fetching service:", error);
            bookingsData.push(bookingData);
          }
        }
      }

      // Sort by createdAt desc
      bookingsData.sort((a, b) => {
        const aTime = a.createdAt?.seconds || a.createdAt?.getTime?.() || 0;
        const bTime = b.createdAt?.seconds || b.createdAt?.getTime?.() || 0;
        return bTime - aTime;
      });

      setMyBookings(bookingsData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching bookings:", error);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [user, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-10 h-10 border-4 border-orange-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  // Separate pending and other bookings
  const pendingBookings = myBookings.filter((b) => b.status === "pending");
  const otherBookings = myBookings.filter((b) => b.status !== "pending");

  const totalBookings = myBookings.length;
  const upcomingBookings = myBookings.filter(
    (b) => b.status === "pending" || b.status === "accepted",
  ).length;
  const completedBookings = myBookings.filter(
    (b) => b.status === "completed",
  ).length;

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-bold">
            Hello, {user.name?.split(" ")[0]} 👋
          </h1>
          <p className="text-gray-600 mt-1">
            Manage your bookings and discover new services in {user.city}
          </p>
        </div>
        <Link
          href="/services"
          className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-4 rounded-2xl font-semibold flex items-center gap-3 transition-all"
        >
          Browse Services
          <ArrowRight className="w-5 h-5" />
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white p-8 rounded-3xl border shadow-sm">
          <p className="text-gray-500 text-sm">Total Bookings</p>
          <p className="text-5xl font-bold mt-4">{totalBookings}</p>
        </div>

        <div className="bg-white p-8 rounded-3xl border shadow-sm">
          <p className="text-gray-500 text-sm">Upcoming</p>
          <p className="text-5xl font-bold mt-4 text-amber-600">
            {upcomingBookings}
          </p>
        </div>

        <div className="bg-white p-8 rounded-3xl border shadow-sm">
          <p className="text-gray-500 text-sm">Completed</p>
          <p className="text-5xl font-bold mt-4 text-green-600">
            {completedBookings}
          </p>
        </div>
      </div>

      {/* My Bookings Section */}
      <div className="mb-10">
        <h2 className="text-3xl font-semibold mb-6">My Bookings</h2>

        {myBookings.length === 0 ? (
          <div className="bg-white border rounded-3xl p-16 text-center">
            <Calendar className="w-20 h-20 mx-auto text-gray-300 mb-6" />
            <h3 className="text-2xl font-semibold mb-3">No bookings yet</h3>
            <p className="text-gray-600 max-w-md mx-auto mb-8">
              When you book a service, it will appear here. Start exploring
              services.
            </p>
            <Link
              href="/services"
              className="inline-block bg-orange-600 text-white px-10 py-4 rounded-2xl font-semibold hover:bg-orange-700 transition"
            >
              Browse Services
            </Link>
          </div>
        ) : (
          <>
            {/* Pending Requests - Highlighted */}
            {pendingBookings.length > 0 && (
              <div className="mb-12">
                <h3 className="text-2xl font-bold text-orange-700 mb-6">
                  Pending Requests
                </h3>
                <div className="space-y-6">
                  {pendingBookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="bg-white border border-orange-200 rounded-3xl p-8 hover:shadow-xl transition-all flex flex-col md:flex-row gap-8"
                    >
                      <div className="flex-1">
                        <div className="inline-block px-4 py-1 rounded-full text-sm font-medium mb-4 bg-orange-100 text-orange-700">
                          PENDING
                        </div>
                        <h4 className="text-2xl font-semibold">
                          {booking.service?.title || "Service Booking"}
                        </h4>
                        <p className="text-gray-600 mt-2">
                          ₹{booking.totalAmount} •{" "}
                          {new Date(booking.bookingDate).toLocaleDateString(
                            "en-IN",
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            },
                          )}
                        </p>
                      </div>

                      <div className="flex-1 text-sm text-gray-600">
                        <p>
                          <span className="font-medium">Address:</span>{" "}
                          {booking.address}
                        </p>
                        {booking.notes && (
                          <p className="mt-3">
                            <span className="font-medium">Notes:</span>{" "}
                            {booking.notes}
                          </p>
                        )}
                      </div>

                      <div>
                        <Link
                          href={`/booking/${booking.id}`}
                          className="px-8 py-3.5 border border-orange-300 rounded-2xl hover:bg-orange-50 transition flex items-center gap-2 font-medium"
                        >
                          View Details
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* All Other Bookings */}
            {otherBookings.length > 0 && (
              <div>
                <h3 className="text-2xl font-semibold mb-6">All Bookings</h3>
                <div className="space-y-6">
                  {otherBookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="bg-white border border-gray-200 rounded-3xl p-8 hover:shadow-xl transition-all flex flex-col md:flex-row gap-8"
                    >
                      <div className="flex-1">
                        <div
                          className={`inline-block px-4 py-1 rounded-full text-sm font-medium mb-4 ${
                            booking.status === "completed"
                              ? "bg-green-100 text-green-700"
                              : booking.status === "accepted"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {booking.status.toUpperCase()}
                        </div>
                        <h4 className="text-2xl font-semibold">
                          {booking.service?.title || "Service Booking"}
                        </h4>
                        <p className="text-gray-600 mt-2">
                          ₹{booking.totalAmount} •{" "}
                          {new Date(booking.bookingDate).toLocaleDateString(
                            "en-IN",
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            },
                          )}
                        </p>
                      </div>

                      <div className="flex-1 text-sm text-gray-600">
                        <p>
                          <span className="font-medium">Address:</span>{" "}
                          {booking.address}
                        </p>
                        {booking.notes && (
                          <p className="mt-3">
                            <span className="font-medium">Notes:</span>{" "}
                            {booking.notes}
                          </p>
                        )}
                      </div>

                      <div>
                        <Link
                          href={`/booking/${booking.id}`}
                          className="px-8 py-3.5 border border-gray-300 rounded-2xl hover:bg-gray-50 transition flex items-center gap-2 font-medium"
                        >
                          View Details
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
