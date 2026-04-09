"use client";

import { useEffect, useState, useCallback } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  orderBy,
  getDoc,
  onSnapshot,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { Booking, Service } from "@/types";
import Link from "next/link";
import {
  CheckCircle,
  XCircle,
  Clock,
  MessageCircle,
  ArrowRight,
} from "lucide-react";

export default function ProviderBookingsPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<(Booking & { service?: Service })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) return;

    const serviceCache = new Map<string, Service>();

    const q = query(
      collection(db, "bookings"),
      where("providerId", "==", user.uid)
    );

    // Set up real-time listener
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

      setBookings(bookingsData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching bookings:", error);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [user?.uid]);

  const updateBookingStatus = async (bookingId: string, newStatus: string) => {
    const confirmMessage =
      newStatus === "accepted"
        ? "Accept this booking?"
        : newStatus === "cancelled"
          ? "Reject this booking?"
          : newStatus === "in-progress"
            ? "Mark as In Progress?"
            : newStatus === "completed"
              ? "Mark as Completed?"
              : "Update status?";

    if (!confirm(confirmMessage)) return;

    try {
      await updateDoc(doc(db, "bookings", bookingId), {
        status: newStatus,
        updatedAt: new Date(),
      });

      alert(`Booking updated to ${newStatus}`);
      // Real-time listener will automatically update the UI
    } catch (error) {
      console.error(error);
      alert("Failed to update status. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-10 h-10 border-4 border-orange-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your bookings...</p>
        </div>
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 text-center">
        <Clock className="w-16 h-16 mx-auto text-gray-400 mb-6" />
        <h2 className="text-3xl font-semibold mb-3">No Bookings Yet</h2>
        <p className="text-gray-600 max-w-md mx-auto">
          When customers book your services, they will appear here.
        </p>
        <Link
          href="/dashboard/provider/services"
          className="mt-6 inline-block bg-orange-600 text-white px-8 py-4 rounded-2xl font-semibold"
        >
          Manage Your Services
        </Link>
      </div>
    );
  }

  const pendingBookings = bookings.filter((b) => b.status === "pending");
  const otherBookings = bookings.filter((b) => b.status !== "pending");

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-4xl font-bold">My Bookings</h1>
          <p className="text-gray-600 mt-2">
            Manage customer requests and service status
          </p>
        </div>
        <Link
          href="/dashboard/provider"
          className="text-orange-600 hover:underline flex items-center gap-2 font-medium"
        >
          Back to Dashboard <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Pending Requests */}
      {pendingBookings.length > 0 && (
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-6 text-orange-700">
            Pending Requests
          </h2>
          <div className="space-y-8">
            {pendingBookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-white border-2 border-orange-200 rounded-3xl p-8 hover:shadow-xl transition-all"
              >
                <div className="flex flex-col lg:flex-row gap-8">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="px-5 py-1.5 rounded-full text-sm font-semibold bg-orange-100 text-orange-700">
                        PENDING
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(booking.bookingDate).toLocaleDateString(
                          "en-IN",
                          {
                            weekday: "short",
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          },
                        )}
                      </div>
                    </div>

                    <h3 className="text-2xl font-semibold">{booking.service?.title || "Service Request"}</h3>
                    <p className="text-gray-600 mt-2">
                      Amount:{" "}
                      <span className="font-bold text-xl">
                        ₹{booking.totalAmount}
                      </span>
                    </p>

                    <div className="mt-6 space-y-3 text-sm">
                      <p>
                        <span className="font-medium">Address:</span>{" "}
                        {booking.address}
                      </p>
                      {booking.notes && (
                        <p>
                          <span className="font-medium">Notes:</span>{" "}
                          {booking.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="lg:w-80 flex flex-col gap-4">
                    <button
                      onClick={() =>
                        updateBookingStatus(booking.id, "accepted")
                      }
                      className="flex items-center justify-center gap-3 bg-green-600 hover:bg-green-700 text-white py-4 rounded-2xl font-medium transition"
                    >
                      <CheckCircle className="w-5 h-5" />
                      Accept
                    </button>

                    <button
                      onClick={() =>
                        updateBookingStatus(booking.id, "cancelled")
                      }
                      className="flex items-center justify-center gap-3 bg-red-600 hover:bg-red-700 text-white py-4 rounded-2xl font-medium transition"
                    >
                      <XCircle className="w-5 h-5" />
                      Reject
                    </button>

                    <Link
                      href={`/booking/${booking.id}`}
                      className="flex items-center justify-center gap-3 border-2 border-orange-600 text-orange-600 hover:bg-orange-50 py-4 rounded-2xl font-medium transition"
                    >
                      <MessageCircle className="w-5 h-5" />
                      Open Chat
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Other Bookings */}
      {otherBookings.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-6">All Bookings</h2>
          <div className="space-y-8">
            {otherBookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-white border rounded-3xl p-8 hover:shadow-xl transition-all"
              >
                <div className="flex flex-col lg:flex-row gap-8">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-6">
                      <div
                        className={`px-5 py-1.5 rounded-full text-sm font-semibold ${
                          booking.status === "accepted"
                            ? "bg-blue-100 text-blue-700"
                            : booking.status === "in-progress"
                              ? "bg-purple-100 text-purple-700"
                              : booking.status === "completed"
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {booking.status.toUpperCase().replace("-", " ")}
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(booking.bookingDate).toLocaleDateString(
                          "en-IN",
                          {
                            weekday: "short",
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          },
                        )}
                      </div>
                    </div>

                    <h3 className="text-2xl font-semibold">{booking.service?.title || "Service Request"}</h3>
                    <p className="text-gray-600 mt-2">
                      Amount:{" "}
                      <span className="font-bold text-xl">
                        ₹{booking.totalAmount}
                      </span>
                    </p>

                    <div className="mt-6 space-y-3 text-sm">
                      <p>
                        <span className="font-medium">Address:</span>{" "}
                        {booking.address}
                      </p>
                      {booking.notes && (
                        <p>
                          <span className="font-medium">Notes:</span>{" "}
                          {booking.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="lg:w-80 flex flex-col gap-4">
                    {booking.status === "accepted" && (
                      <button
                        onClick={() =>
                          updateBookingStatus(booking.id, "in-progress")
                        }
                        className="bg-purple-600 hover:bg-purple-700 text-white py-4 rounded-2xl font-medium transition"
                      >
                        Mark as In Progress
                      </button>
                    )}

                    {booking.status === "in-progress" && (
                      <button
                        onClick={() =>
                          updateBookingStatus(booking.id, "completed")
                        }
                        className="bg-green-600 hover:bg-green-700 text-white py-4 rounded-2xl font-medium transition"
                      >
                        Mark as Completed
                      </button>
                    )}

                    <Link
                      href={`/booking/${booking.id}`}
                      className="flex items-center justify-center gap-3 border-2 border-orange-600 text-orange-600 hover:bg-orange-50 py-4 rounded-2xl font-medium transition"
                    >
                      <MessageCircle className="w-5 h-5" />
                      Open Chat
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
