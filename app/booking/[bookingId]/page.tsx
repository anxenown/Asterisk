"use client";

import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { useParams } from "next/navigation";
import Chat from "@/components/Chat";
import { Booking } from "@/types";
import ReviewModal from "@/components/ReviewModal"; // We'll create this component for leaving reviews

export default function BookingDetailPage() {
  const { bookingId } = useParams();
  const { user } = useAuth();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [otherName, setOtherName] = useState("Service Provider");
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);

  useEffect(() => {
    const fetchBooking = async () => {
      if (!bookingId) return;
      const docSnap = await getDoc(doc(db, "bookings", bookingId as string));
      if (docSnap.exists()) {
        const data = { id: docSnap.id, ...docSnap.data() } as Booking;
        setBooking(data);

        // For demo: you can fetch the other user's name here if needed
      }
    };
    fetchBooking();
  }, [bookingId]);

  if (!booking)
    return <div className="py-20 text-center">Loading booking...</div>;

  const isCustomer = user?.uid === booking.customerId;
  const chatTitle = isCustomer ? "Provider" : "Customer";

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-8">Booking Details & Chat</h1>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Booking Info Sidebar */}
        <div className="lg:col-span-2 bg-white border rounded-3xl p-8 h-fit">
          <h2 className="font-semibold text-xl mb-6">Booking Information</h2>
          <div className="space-y-4 text-sm">
            <p>
              <span className="font-medium">Status:</span>{" "}
              <span className="capitalize font-medium">{booking.status}</span>
            </p>
            <p>
              <span className="font-medium">Date:</span>{" "}
              {new Date(booking.bookingDate).toLocaleDateString("en-IN")}
            </p>
            <p>
              <span className="font-medium">Address:</span> {booking.address}
            </p>
            <p>
              <span className="font-medium">Payment:</span> {booking.paymentMethod === "online" ? "Online Payment" : "Cash on Service Delivery"}
            </p>
            <p>
              <span className="font-medium">Amount:</span> ₹
              {booking.totalAmount}
            </p>
            {booking.notes && (
              <p>
                <span className="font-medium">Notes:</span> {booking.notes}
              </p>
            )}
          </div>
        </div>
        {/* Chat Area */}
        <div className="lg:col-span-3">
          <Chat bookingId={booking.id} otherUserName={chatTitle} />
        </div>
    
        {booking.status === "completed" && !hasReviewed && (
          <div className="mt-12 bg-white border rounded-3xl p-10">
            <h3 className="text-2xl font-semibold mb-6">
              How was the service?
            </h3>
            <p className="text-gray-600 mb-8">
              Please rate and review to help other customers
            </p>

            <button
              onClick={() => setShowReviewModal(true)}
              className="bg-orange-600 text-white px-10 py-4 rounded-2xl font-semibold hover:bg-orange-700"
            >
              Leave a Review
            </button>
          </div>
        )}
        {showReviewModal && (
          <ReviewModal
            bookingId={booking.id}
            serviceId={booking.serviceId}
            providerId={booking.providerId}
            onClose={() => setShowReviewModal(false)}
            onReviewed={() => {
              if (typeof window !== "undefined") {
                window.location.reload();
              }
            }}
          />
        )}
      </div>
    </div>
  );
}
