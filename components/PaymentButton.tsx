"use client";

import Script from "next/script";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface PaymentButtonProps {
  bookingId: string;
  amount: number; // in rupees
  bookingStatus: string;
  onPaymentSuccess?: () => void;
}

export default function PaymentButton({
  bookingId,
  amount,
  bookingStatus,
  onPaymentSuccess,
}: PaymentButtonProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const initializeRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    if (bookingStatus !== "accepted") {
      alert("Provider must accept the booking first");
      return;
    }

    setLoading(true);

    try {
      // 1. Create order on server
      const res = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          bookingId,
          customerName: user?.name,
        }),
      });

      const orderData = await res.json();

      if (!res.ok) throw new Error(orderData.error || "Failed to create order");

      const isReady = await initializeRazorpay();
      if (!isReady) {
        alert("Razorpay SDK failed to load");
        return;
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "JanSahay",
        description: `Payment for Booking #${bookingId.slice(0, 8)}`,
        order_id: orderData.id,
        handler: async function (response: any) {
          // Verify payment on backend (recommended in production)
          const verifyRes = await fetch("/api/verify-payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              bookingId,
            }),
          });

          if (verifyRes.ok) {
            // Update booking status in Firestore
            await updateDoc(doc(db, "bookings", bookingId), {
              status: "in-progress",
              paymentId: response.razorpay_payment_id,
              paidAt: new Date(),
            });

            alert("Payment successful! 🎉 Service is now in progress.");
            onPaymentSuccess?.();
          } else {
            alert("Payment verification failed. Please contact support.");
          }
        },
        prefill: {
          name: user?.name || "",
          email: user?.email || "",
          contact: user?.phone || "",
        },
        theme: { color: "#f97316" }, // Orange-600
      };

      let paymentObject;
      if (typeof window !== "undefined") {
        paymentObject = new (window as any).Razorpay(options);
      }
      paymentObject.open();
    } catch (error: any) {
      console.error(error);
      alert(error.message || "Payment initiation failed");
    } finally {
      setLoading(false);
    }
  };

  if (bookingStatus === "completed" || bookingStatus === "in-progress") {
    return (
      <div className="text-green-600 font-medium px-6 py-3 bg-green-50 rounded-2xl inline-block">
        ✓ Payment Completed
      </div>
    );
  }

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      <button
        onClick={handlePayment}
        disabled={loading || bookingStatus !== "accepted"}
        className="bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white font-semibold px-10 py-4 rounded-2xl transition w-full"
      >
        {loading ? "Processing..." : `Pay ₹${amount} Now`}
      </button>
      <p className="text-xs text-gray-500 text-center mt-3">
        Secure payment powered by Razorpay
      </p>
    </>
  );
}
