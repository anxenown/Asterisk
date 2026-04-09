"use client";

import { useEffect, useState } from "react";
import {
  doc,
  getDoc,
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { useParams, useRouter } from "next/navigation";
import { Service, User } from "@/types";
import { Calendar, Clock, MapPin, User as UserIcon } from "lucide-react";

export default function BookServicePage() {
  const { serviceId } = useParams();
  const { user } = useAuth();
  const router = useRouter();

  const [service, setService] = useState<Service | null>(null);
  const [provider, setProvider] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [bookingDate, setBookingDate] = useState("");
  const [timeSlot, setTimeSlot] = useState("");
  const [address, setAddress] = useState(
    user?.city ? `${user.city}, ${user.pincode}` : "",
  );
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash"); // default to cash

  useEffect(() => {
    const fetchServiceAndProvider = async () => {
      if (!serviceId) return;

      const serviceDoc = await getDoc(doc(db, "services", serviceId as string));
      if (serviceDoc.exists()) {
        const serviceData = {
          id: serviceDoc.id,
          ...serviceDoc.data(),
        } as Service;
        setService(serviceData);

        // Fetch provider details
        const providerDoc = await getDoc(
          doc(db, "users", serviceData.providerId),
        );
        if (providerDoc.exists()) {
          setProvider({ uid: providerDoc.id, ...providerDoc.data() } as User);
        }
      }
      setLoading(false);
    };

    fetchServiceAndProvider();
  }, [serviceId]);

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !service || !bookingDate || !timeSlot || !address || !paymentMethod) {
      alert("Please fill all required fields");
      return;
    }

    setSubmitting(true);

    try {
      const bookingData = {
        customerId: user.uid,
        providerId: service.providerId,
        serviceId: service.id,
        status: "pending" as const,
        bookingDate: new Date(`${bookingDate} ${timeSlot}`),
        address,
        notes,
        totalAmount: service.price,
        paymentMethod,
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, "bookings"), bookingData);

      alert(
        "Booking request sent successfully! 🎉 The provider will confirm soon.",
      );
      router.push("/dashboard/customer");
    } catch (error) {
      console.error(error);
      alert("Failed to create booking. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading)
    return <div className="py-20 text-center">Loading service details...</div>;
  if (!service)
    return <div className="py-20 text-center">Service not found.</div>;

  // Simple time slots (you can enhance with real availability later)
  const timeSlots = [
    "09:00 AM",
    "10:00 AM",
    "11:00 AM",
    "02:00 PM",
    "03:00 PM",
    "04:00 PM",
    "05:00 PM",
  ];

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold mb-2">Book Service</h1>
      <p className="text-gray-600">Confirm details with {provider?.name}</p>

      <div className="mt-10 bg-white rounded-3xl shadow p-10">
        <div className="flex gap-8 border-b pb-8">
          <div className="flex-1">
            <h2 className="text-2xl font-semibold">{service.title}</h2>
            <p className="text-orange-600 font-medium mt-1">
              {service.category.toUpperCase()}
            </p>
            <p className="mt-6 text-gray-700">{service.description}</p>
          </div>
          <div className="text-right">
            <div className="text-5xl font-bold">₹{service.price}</div>
            <div className="text-gray-500">{service.priceType}</div>
            <div className="mt-4 text-sm">{service.duration}</div>
          </div>
        </div>

        <form onSubmit={handleBook} className="mt-10 space-y-8">
          <div>
            <label className="block text-sm font-medium mb-2">
              Preferred Date
            </label>
            <input
              type="date"
              value={bookingDate}
              onChange={(e) => setBookingDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              className="w-full p-4 border rounded-2xl focus:outline-none focus:border-orange-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-3">
              Preferred Time
            </label>
            <div className="grid grid-cols-3 gap-3">
              {timeSlots.map((slot) => (
                <button
                  key={slot}
                  type="button"
                  onClick={() => setTimeSlot(slot)}
                  className={`p-4 border rounded-2xl text-center hover:border-orange-500 transition ${
                    timeSlot === slot
                      ? "border-orange-600 bg-orange-50 font-medium"
                      : ""
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Full Address
            </label>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full p-4 border rounded-2xl focus:outline-none focus:border-orange-500"
              rows={3}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Additional Notes (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any specific requirements..."
              className="w-full p-4 border rounded-2xl focus:outline-none focus:border-orange-500"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Payment Method</label>
            <div className="flex gap-6">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cash"
                  checked={paymentMethod === "cash"}
                  onChange={() => setPaymentMethod("cash")}
                  className="accent-orange-600"
                />
                Cash on Service Delivery
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="online"
                  checked={paymentMethod === "online"}
                  onChange={() => setPaymentMethod("online")}
                  className="accent-orange-600"
                />
                Online Payment
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white font-semibold py-5 rounded-2xl text-xl transition"
          >
            {submitting ? "Sending Booking Request..." : "Confirm Booking"}
          </button>
        </form>
      </div>
    </div>
  );
}
