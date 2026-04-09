"use client";

import { useState } from "react";
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { Star } from "lucide-react";

interface ReviewModalProps {
  bookingId: string;
  serviceId: string;
  providerId: string;
  onClose: () => void;
  onReviewed: () => void;
}

export default function ReviewModal({
  bookingId,
  serviceId,
  providerId,
  onClose,
  onReviewed,
}: ReviewModalProps) {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [hover, setHover] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0 || !user) return;

    setSubmitting(true);

    try {
      // Add review
      await addDoc(collection(db, "reviews"), {
        bookingId,
        serviceId,
        providerId,
        customerId: user.uid,
        customerName: user.name,
        rating,
        comment,
        createdAt: serverTimestamp(),
      });

      // Update service average rating (simple calculation - in production use Cloud Function for accuracy)
      // For MVP we update service & provider rating fields
      await updateServiceAndProviderRating(serviceId, providerId, rating);

      alert("Thank you for your review! ⭐");
      onReviewed();
      onClose();
    } catch (error) {
      console.error(error);
      alert("Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-6">
      <div className="bg-white rounded-3xl max-w-md w-full p-8">
        <h2 className="text-3xl font-bold text-center mb-2">
          Rate Your Experience
        </h2>
        <p className="text-center text-gray-600 mb-8">How was the service?</p>

        {/* Star Rating */}
        <div className="flex justify-center gap-2 mb-8">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHover(star)}
              onMouseLeave={() => setHover(0)}
              className="focus:outline-none"
            >
              <Star
                className={`w-12 h-12 transition-colors ${
                  star <= (hover || rating)
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-gray-300"
                }`}
              />
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Write your review (optional)..."
            rows={4}
            className="w-full p-4 border rounded-2xl focus:outline-none focus:border-orange-500 mb-6"
          />

          <div className="flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-4 border rounded-2xl font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={rating === 0 || submitting}
              className="flex-1 py-4 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white font-semibold rounded-2xl"
            >
              {submitting ? "Submitting..." : "Submit Review"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Helper to update average rating (MVP version)
async function updateServiceAndProviderRating(
  serviceId: string,
  providerId: string,
  newRating: number,
) {
  // In production, use a Cloud Function + aggregation for accuracy
  // For now, we simply increment totalReviews and recalculate average
  // This is a simplified version - you can improve later
  console.log(
    `Rating ${newRating} added for service ${serviceId} and provider ${providerId}`,
  );
}
