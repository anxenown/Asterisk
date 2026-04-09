"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { collection, query, where, getDocs, orderBy, doc, getDoc, onSnapshot, Query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { Booking, Service } from "@/types";

export default function BookingsPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<(Booking & { service?: Service })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    const serviceCache = new Map<string, Service>();

    const fetchBookingsWithRealTime = async () => {
      // Create queries for both customer and provider bookings
      const customerQuery = query(
        collection(db, "bookings"),
        where("customerId", "==", user.uid)
      );

      const providerQuery = query(
        collection(db, "bookings"),
        where("providerId", "==", user.uid)
      );

      // Set up real-time listeners
      const unsubscribeCustomer = onSnapshot(customerQuery, async (customerSnapshot) => {
        const processBookings = async (snapshot: any) => {
          const allBookings: (Booking & { service?: Service })[] = [];

          for (const docSnap of snapshot.docs) {
            const bookingData = { id: docSnap.id, ...docSnap.data() } as Booking;
            
            // Try to get from cache first
            if (serviceCache.has(bookingData.serviceId)) {
              allBookings.push({ ...bookingData, service: serviceCache.get(bookingData.serviceId) });
            } else {
              // Fetch service details
              try {
                const serviceDoc = await getDoc(doc(db, "services", bookingData.serviceId));
                if (serviceDoc.exists()) {
                  const serviceData = { id: serviceDoc.id, ...serviceDoc.data() } as Service;
                  serviceCache.set(bookingData.serviceId, serviceData);
                  allBookings.push({ ...bookingData, service: serviceData });
                } else {
                  allBookings.push(bookingData);
                }
              } catch (error) {
                console.error("Error fetching service:", error);
                allBookings.push(bookingData);
              }
            }
          }

          return allBookings;
        };

        // Also get provider bookings
        const providerSnapshot = await getDocs(providerQuery);
        const customerBookings = await processBookings(customerSnapshot);
        const providerBookings = await processBookings(providerSnapshot);

        const allBookings = [...customerBookings, ...providerBookings];

        // Sort by createdAt desc
        allBookings.sort((a, b) => {
          const aTime = a.createdAt?.seconds || a.createdAt?.getTime?.() || 0;
          const bTime = b.createdAt?.seconds || b.createdAt?.getTime?.() || 0;
          return bTime - aTime;
        });

        setBookings(allBookings);
        setLoading(false);
      }, (error) => {
        console.error("Error fetching customer bookings:", error);
        setLoading(false);
      });

      // Return cleanup function
      return () => unsubscribeCustomer();
    };

    const cleanup = fetchBookingsWithRealTime();
    
    return () => {
      cleanup.then(unsubscribe => unsubscribe?.());
    };
  }, [user?.uid]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl">Loading your bookings...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-4xl font-bold text-gray-900">My Bookings</h1>

        <Link href="/services" className="btn-primary px-8 py-3 text-lg">
          Browse Services
        </Link>
      </div>

      {bookings.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-3xl p-16 text-center">
          <div className="mx-auto w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mb-6">
            📅
          </div>
          <h2 className="text-2xl font-semibold mb-3">No bookings yet</h2>
          <p className="text-gray-600 max-w-md mx-auto mb-8">
            When you book a service from a provider, all your bookings will
            appear here.
          </p>
          <Link
            href="/services"
            className="inline-block bg-orange-600 text-white px-8 py-4 rounded-2xl font-medium hover:bg-orange-700 transition"
          >
            Find Services Near You
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {bookings.map((booking) => (
            <Link
              key={booking.id}
              href={`/booking/${booking.id}`}
              className="block bg-white border border-gray-200 rounded-3xl p-7 hover:border-orange-500 hover:shadow-lg transition-all group"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span
                    className={`inline-block px-3 py-1 text-xs font-medium rounded-full capitalize
                    ${
                      booking.status === "completed"
                        ? "bg-green-100 text-green-700"
                        : booking.status === "cancelled"
                          ? "bg-red-100 text-red-700"
                          : "bg-orange-100 text-orange-700"
                    }`}
                  >
                    {booking.status}
                  </span>
                </div>
                <p className="text-sm text-gray-500">
                  {new Date(booking.bookingDate).toLocaleDateString("en-IN")}
                </p>
              </div>

              <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                {booking.service?.title || "Service Booking"}
              </h3>

              <div className="space-y-2 text-sm text-gray-600">
                <p>
                  <span className="font-medium">Amount:</span> ₹
                  {booking.totalAmount}
                </p>
                <p>
                  <span className="font-medium">Payment:</span> {booking.paymentMethod === "online" ? "Online Payment" : "Cash on Service Delivery"}
                </p>
                <p>
                  <span className="font-medium">Address:</span>{" "}
                  {booking.address}
                </p>
                {booking.notes && (
                  <p className="line-clamp-2">
                    <span className="font-medium">Notes:</span> {booking.notes}
                  </p>
                )}
              </div>

              <div className="mt-6 text-orange-600 font-medium group-hover:underline">
                View Details & Chat →
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
