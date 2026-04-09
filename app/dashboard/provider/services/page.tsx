"use client";

import { useEffect, useState, useCallback } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { Service } from "@/types";
import { Edit2, Trash2, Plus } from "lucide-react";
import Link from "next/link";
import EditServiceModal from "@/components/EditServiceModal";

export default function ProviderServicesPage() {
  const { user } = useAuth();

  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // ✅ Memoized fetch (prevents unnecessary re-renders)
  const fetchServices = useCallback(async () => {
    if (!user?.uid) return;

    setLoading(true);
    try {
      const q = query(
        collection(db, "services"),
        where("providerId", "==", user.uid),
      );

      const snapshot = await getDocs(q);

      const data: Service[] = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...(docSnap.data() as Omit<Service, "id">),
      }));

      setServices(data);
    } catch (error) {
      console.error("Error fetching services:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  // ✅ Delete service
  const handleDelete = async (serviceId: string) => {
    const confirmDelete = typeof window !== "undefined" && window.confirm(
      "Are you sure you want to delete this service? This action cannot be undone.",
    );

    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, "services", serviceId));
      alert("Service deleted successfully");

      // Optimistic update (faster UI)
      setServices((prev) => prev.filter((s) => s.id !== serviceId));
    } catch (error) {
      console.error(error);
      alert("Failed to delete service");
    }
  };

  const openEditModal = (service: Service) => {
    setEditingService(service);
    setShowEditModal(true);
  };

  const closeModal = () => {
    setEditingService(null);
    setShowEditModal(false);
  };

  // ✅ Loading state
  if (loading) {
    return (
      <div className="text-center py-20 text-lg">Loading your services...</div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-4xl font-bold">My Services</h1>
          <p className="text-gray-600 mt-2">Manage all your offerings</p>
        </div>

        <Link
          href="/dashboard/provider/add-service"
          className="flex items-center gap-3 bg-orange-600 hover:bg-orange-700 text-white px-8 py-4 rounded-2xl font-semibold transition"
        >
          <Plus className="w-5 h-5" />
          Add New Service
        </Link>
      </div>

      {/* Empty State */}
      {services.length === 0 ? (
        <div className="bg-white border rounded-3xl p-20 text-center">
          <p className="text-2xl text-gray-500">
            You haven’t added any services yet.
          </p>

          <Link
            href="/dashboard/provider/add-service"
            className="mt-6 inline-block bg-orange-600 hover:bg-orange-700 text-white px-10 py-4 rounded-2xl transition"
          >
            Add Your First Service
          </Link>
        </div>
      ) : (
        <div className="bg-white border rounded-3xl overflow-hidden shadow-sm">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-8 py-5 text-left font-medium">
                  Service Title
                </th>
                <th className="px-8 py-5 text-left font-medium">Category</th>
                <th className="px-8 py-5 text-left font-medium">Price</th>
                <th className="px-8 py-5 text-left font-medium">Duration</th>
                <th className="px-8 py-5 text-center font-medium">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {services.map((service) => (
                <tr key={service.id} className="hover:bg-gray-50 transition">
                  <td className="px-8 py-6 font-medium">{service.title}</td>

                  <td className="px-8 py-6 capitalize text-gray-600">
                    {service.category}
                  </td>

                  <td className="px-8 py-6">
                    ₹{service.price}
                    <span className="text-sm text-gray-500 ml-1">
                      /{service.priceType}
                    </span>
                  </td>

                  <td className="px-8 py-6 text-gray-600">
                    {service.duration || "-"}
                  </td>

                  <td className="px-8 py-6">
                    <div className="flex justify-center gap-4">
                      <button
                        onClick={() => openEditModal(service)}
                        className="p-3 hover:bg-blue-50 text-blue-600 rounded-xl transition"
                        title="Edit"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>

                      <button
                        onClick={() => handleDelete(service.id)}
                        className="p-3 hover:bg-red-50 text-red-600 rounded-xl transition"
                        title="Delete"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ✅ Edit Modal */}
      {showEditModal && editingService && (
        <EditServiceModal
          service={editingService}
          onClose={closeModal}
          onUpdated={fetchServices}
        />
      )}
    </div>
  );
}
