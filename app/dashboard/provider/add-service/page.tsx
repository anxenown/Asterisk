"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

const serviceSchema = z.object({
  title: z.string().min(5, "Title is too short"),
  category: z.enum([
    "plumbing",
    "electrical",
    "tutoring",
    "delivery",
    "cleaning",
    "other",
  ]),
  description: z.string().min(20, "Please provide a detailed description"),
  price: z.number().min(50, "Price must be at least ₹50"),
  priceType: z.enum(["fixed", "hourly"]),
  duration: z.string().min(2, "Duration is required"),
});

type ServiceForm = z.infer<typeof serviceSchema>;

export default function AddServicePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ServiceForm>({
    resolver: zodResolver(serviceSchema),
    defaultValues: { priceType: "fixed", category: "plumbing" },
  });

  const onSubmit = async (data: ServiceForm) => {
    if (!user) return;

    setLoading(true);

    try {
      await addDoc(collection(db, "services"), {
        ...data,
        providerId: user.uid,
        city: user.city,
        pincode: user.pincode,
        createdAt: serverTimestamp(),
      });

      alert("Service added successfully! 🎉");
      router.push("/dashboard/provider");
    } catch (err) {
      alert("Failed to add service. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold mb-2">Add New Service</h1>
      <p className="text-gray-600 mb-10">
        Reach more customers in Lucknow & nearby areas
      </p>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white rounded-3xl p-10 shadow"
      >
        <div className="space-y-8">
          <div>
            <label className="block text-sm font-medium mb-2">
              Service Title
            </label>
            <input
              {...register("title")}
              type="text"
              className="w-full p-4 border rounded-2xl focus:outline-none focus:border-orange-500"
              placeholder="e.g. Expert Plumbing Repair & Installation"
            />
            {errors.title && (
              <p className="text-red-500 text-sm mt-1">
                {errors.title.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Category</label>
            <select
              {...register("category")}
              className="w-full p-4 border rounded-2xl focus:outline-none focus:border-orange-500"
            >
              <option value="plumbing">Plumbing</option>
              <option value="electrical">Electrical Work</option>
              <option value="tutoring">Home Tutoring</option>
              <option value="delivery">Delivery / Pickup</option>
              <option value="cleaning">Home Cleaning</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Description
            </label>
            <textarea
              {...register("description")}
              rows={5}
              className="w-full p-4 border rounded-2xl focus:outline-none focus:border-orange-500"
              placeholder="Describe what you offer, your experience, tools used, etc."
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                Price (₹)
              </label>
              <input
                {...register("price", { valueAsNumber: true })}
                type="number"
                className="w-full p-4 border rounded-2xl focus:outline-none focus:border-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Price Type
              </label>
              <select
                {...register("priceType")}
                className="w-full p-4 border rounded-2xl focus:outline-none focus:border-orange-500"
              >
                <option value="fixed">Fixed Price</option>
                <option value="hourly">Hourly Rate</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Estimated Duration
            </label>
            <input
              {...register("duration")}
              type="text"
              className="w-full p-4 border rounded-2xl focus:outline-none focus:border-orange-500"
              placeholder="e.g. 1-2 hours, 45 minutes, Same day"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-5 rounded-2xl text-lg disabled:opacity-70"
          >
            {loading ? "Adding Service..." : "Publish Service"}
          </button>
        </div>
      </form>
    </div>
  );
}
