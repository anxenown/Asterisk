"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, Mail, Lock, Phone, MapPin } from "lucide-react";

const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  city: z.string().min(2, "City is required"),
  pincode: z.string().length(6, "Pincode must be 6 digits"),
  role: z.enum(["customer", "provider"]),
});

type SignupForm = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [redirectParam, setRedirectParam] = useState<string | null>(null);
  const router = useRouter();

  // Get redirect parameter from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setRedirectParam(params.get("redirect"));
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
    defaultValues: { role: "customer" },
  });

  const onSubmit = async (data: SignupForm) => {
    setLoading(true);
    setError("");

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password,
      );
      const user = userCredential.user;

      // Update Firebase Auth profile
      await updateProfile(user, { displayName: data.name });

      // Create user document in Firestore
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: data.email,
        name: data.name,
        phone: data.phone,
        role: data.role,
        city: data.city,
        pincode: data.pincode,
        createdAt: new Date(),
        ...(data.role === "provider" && {
          bio: "",
          experience: 0,
          rating: 0,
          totalReviews: 0,
        }),
      });

      alert("Account created successfully! Welcome to JanSahay 🎉");
      // Use redirect parameter if available, otherwise default redirect
      const redirectPath = redirectParam || (data.role === "provider" ? "/dashboard/provider" : "/dashboard/customer");
      router.push(redirectPath);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-orange-600">Join JanSahay</h1>
          <p className="text-gray-600 mt-2">
            Start earning or get help instantly
          </p>
        </div>

        {error && <p className="text-red-600 text-center mb-4">{error}</p>}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-1">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                {...register("name")}
                type="text"
                className="w-full pl-10 p-3 border rounded-2xl focus:outline-none focus:border-orange-500"
                placeholder="Rahul Sharma"
              />
            </div>
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                {...register("email")}
                type="email"
                className="w-full pl-10 p-3 border rounded-2xl focus:outline-none focus:border-orange-500"
                placeholder="you@example.com"
              />
            </div>
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Phone Number
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                {...register("phone")}
                type="tel"
                className="w-full pl-10 p-3 border rounded-2xl focus:outline-none focus:border-orange-500"
                placeholder="9876543210"
              />
            </div>
            {errors.phone && (
              <p className="text-red-500 text-sm mt-1">
                {errors.phone.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">City</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  {...register("city")}
                  type="text"
                  className="w-full pl-10 p-3 border rounded-2xl focus:outline-none focus:border-orange-500"
                  placeholder="Lucknow"
                />
              </div>
              {errors.city && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.city.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Pincode</label>
              <input
                {...register("pincode")}
                type="text"
                className="w-full p-3 border rounded-2xl focus:outline-none focus:border-orange-500"
                placeholder="226001"
                maxLength={6}
              />
              {errors.pincode && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.pincode.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">I want to</label>
            <div className="flex gap-4">
              <label className="flex-1">
                <input
                  type="radio"
                  value="customer"
                  {...register("role")}
                  className="peer hidden"
                />
                <div className="border-2 peer-checked:border-orange-600 peer-checked:bg-orange-50 rounded-2xl p-4 text-center cursor-pointer transition">
                  <p className="font-semibold">Find Services</p>
                  <p className="text-sm text-gray-500">Customer</p>
                </div>
              </label>

              <label className="flex-1">
                <input
                  type="radio"
                  value="provider"
                  {...register("role")}
                  className="peer hidden"
                />
                <div className="border-2 peer-checked:border-orange-600 peer-checked:bg-orange-50 rounded-2xl p-4 text-center cursor-pointer transition">
                  <p className="font-semibold">Offer Services</p>
                  <p className="text-sm text-gray-500">Service Provider</p>
                </div>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                {...register("password")}
                type="password"
                className="w-full pl-10 p-3 border rounded-2xl focus:outline-none focus:border-orange-500"
                placeholder="••••••••"
              />
            </div>
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-4 rounded-2xl transition disabled:opacity-70"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <p className="text-center mt-6 text-gray-600">
          Already have an account?{" "}
          <Link
            href={redirectParam ? `/login?redirect=${encodeURIComponent(redirectParam)}` : "/login"}
            className="text-orange-600 font-medium hover:underline"
          >
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
}

