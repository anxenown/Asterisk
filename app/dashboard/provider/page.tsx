"use client";

import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  onSnapshot,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { Service, Booking } from "@/types";
import Link from "next/link";
import { Plus, Wrench, Calendar, Star, Users } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ProviderDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [services, setServices] = useState<Service[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== "provider") {
      router.push("/login");
      return;
    }

    const fetchServices = async () => {
      // Fetch provider's services
      const servicesQuery = query(
        collection(db, "services"),
        where("providerId", "==", user.uid),
      );
      const servicesSnap = await getDocs(servicesQuery);
      const servicesData = servicesSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Service[];
      setServices(servicesData);
    };

    // Set up real-time listener for bookings
    const bookingsQuery = query(
      collection(db, "bookings"),
      where("providerId", "==", user.uid),
    );
    
    const unsubscribe = onSnapshot(bookingsQuery, (snapshot) => {
      const bookingsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Booking[];
      setBookings(bookingsData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching bookings:", error);
      setLoading(false);
    });

    fetchServices();

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [user, router]);

  if (loading)
    return <div className="text-center py-20">Loading your dashboard...</div>;
  if (!user) return null;

  const totalEarnings = bookings
    .filter((b) => b.status === "completed")
    .reduce((sum, b) => sum + b.totalAmount, 0);

  const pendingBookings = bookings.filter((b) => b.status === "pending").length;

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-4xl font-bold">Welcome back, {user.name} 👋</h1>
          <p className="text-gray-600 mt-1">
            Manage your services and bookings
          </p>
        </div>
        <Link
          href="/dashboard/provider/add-service"
          className="flex items-center gap-3 bg-orange-600 hover:bg-orange-700 text-white px-8 py-4 rounded-2xl font-semibold"
        >
          <Plus className="w-5 h-5" />
          Add New Service
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <div className="bg-white p-8 rounded-3xl shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500">Total Services</p>
              <p className="text-5xl font-bold mt-2">{services.length}</p>
            </div>
            <Wrench className="w-12 h-12 text-orange-600" />
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500">Pending Bookings</p>
              <p className="text-5xl font-bold mt-2 text-amber-600">
                {pendingBookings}
              </p>
            </div>
            <Calendar className="w-12 h-12 text-amber-600" />
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500">Total Earnings</p>
              <p className="text-5xl font-bold mt-2">₹{totalEarnings}</p>
            </div>
            <Star className="w-12 h-12 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500">Rating</p>
              <p className="text-5xl font-bold mt-2">
                {user.rating || "4.8"} ★
              </p>
            </div>
            <Users className="w-12 h-12 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Link
          href="/dashboard/provider/services"
          className="block bg-white border rounded-3xl p-8 hover:shadow-xl transition group"
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-2xl font-semibold">My Services</h3>
              <p className="text-gray-600 mt-2">
                Manage all your offerings • {services.length} active
              </p>
            </div>
            <div className="text-orange-600 group-hover:scale-110 transition">
              →
            </div>
          </div>
        </Link>

        <Link
          href="/dashboard/provider/bookings"
          className="block bg-white border rounded-3xl p-8 hover:shadow-xl transition group"
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-2xl font-semibold">Bookings & Requests</h3>
              <p className="text-gray-600 mt-2">
                View, accept and manage all requests
              </p>
            </div>
            <div className="text-orange-600 group-hover:scale-110 transition">
              →
            </div>
          </div>
        </Link>
      </div>

      {/* Recent Services */}
      <div className="mt-16">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Your Recent Services</h2>
          <Link
            href="/dashboard/provider/services"
            className="text-orange-600 hover:underline"
          >
            View all →
          </Link>
        </div>

        {services.length === 0 ? (
          <div className="bg-white border rounded-3xl p-16 text-center">
            <p className="text-xl text-gray-500">
              You haven’t added any services yet.
            </p>
            <Link
              href="/dashboard/provider/add-service"
              className="mt-6 inline-block bg-orange-600 text-white px-8 py-3 rounded-2xl"
            >
              Add Your First Service
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {services.slice(0, 3).map((service) => (
              <div key={service.id} className="bg-white border rounded-3xl p-6">
                <div className="uppercase text-xs tracking-widest text-orange-600 font-medium">
                  {service.category}
                </div>
                <h3 className="font-semibold text-xl mt-3">{service.title}</h3>
                <p className="text-gray-600 line-clamp-2 mt-2">
                  {service.description}
                </p>
                <div className="mt-6 flex justify-between items-center">
                  <div className="text-2xl font-bold">₹{service.price}</div>
                  <span className="text-sm text-gray-500">
                    {service.duration}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
