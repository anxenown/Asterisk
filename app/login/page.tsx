"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [redirectParam, setRedirectParam] = useState<string | null>(null);

  const router = useRouter();
  const { user } = useAuth();

  // Get redirect parameter from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setRedirectParam(params.get("redirect"));
  }, []);

  // ✅ ALWAYS call hooks at top (no condition before this)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  // Redirect if logged in
  useEffect(() => {
    if (user) {
      // If there's a redirect parameter, use it; otherwise use default
      const redirectPath = redirectParam || (user.role === "provider" ? "/dashboard/provider" : "/dashboard/customer");
      router.push(redirectPath);
    }
  }, [user, router, redirectParam]);

  // ✅ Safe conditional rendering AFTER hooks
  if (user) return null;

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    setError("");

    try {
      await signInWithEmailAndPassword(auth, data.email, data.password);
      // The useEffect will handle redirecting after user state updates
    } catch (err: any) {
      setError(
        err.message.includes("wrong-password")
          ? "Incorrect password"
          : err.message || "Login failed",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-orange-600">Welcome Back</h1>
          <p className="text-gray-600 mt-2">Login to continue with JanSahay</p>
        </div>

        {error && <p className="text-red-600 text-center mb-4">{error}</p>}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Email */}
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

          {/* Password */}
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
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="text-center mt-6">
          <Link
            href={redirectParam ? `/signup?redirect=${encodeURIComponent(redirectParam)}` : "/signup"}
            className="text-orange-600 font-medium hover:underline"
          >
            Don’t have an account? Sign up
          </Link>
        </div>

        <p className="text-xs text-gray-500 text-center mt-8">
          By logging in, you agree to our Terms & Privacy Policy
        </p>
      </div>
    </div>
  );
}
