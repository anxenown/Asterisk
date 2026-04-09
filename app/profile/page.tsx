"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { doc, updateDoc } from "firebase/firestore";
import { updateProfile as updateAuthProfile } from "firebase/auth";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { db, storage, auth } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { Camera, Save, User } from "lucide-react";
import Image from "next/image";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().min(10, "Valid phone number required"),
  city: z.string().min(2),
  pincode: z.string().length(6, "Pincode must be 6 digits"),
  bio: z.string().optional(),
  experience: z.number().min(0).optional(),
});

type ProfileForm = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [photoURL, setPhotoURL] = useState(user?.photoURL || "");
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || "",
      phone: user?.phone || "",
      city: user?.city || "",
      pincode: user?.pincode || "",
      bio: user?.bio || "",
      experience: user?.experience || 0,
    },
  });

  useEffect(() => {
    if (!user) {
      router.push("/login");
    }
  }, [user, router]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    setUploadProgress(0);

    const storageRef = ref(
      storage,
      `profile-photos/${user.uid}/${Date.now()}-${file.name}`,
    );
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = Math.round(
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100,
        );
        setUploadProgress(progress);
      },
      (error) => {
        console.error(error);
        alert("Upload failed");
        setUploading(false);
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        setPhotoURL(downloadURL);

        // Update Auth profile
        await updateAuthProfile(auth.currentUser!, { photoURL: downloadURL });

        // Update Firestore
        await updateDoc(doc(db, "users", user.uid), { photoURL: downloadURL });

        setUploading(false);
        setUploadProgress(100);
        alert("Profile photo updated successfully!");
      },
    );
  };

  const onSubmit = async (data: ProfileForm) => {
    if (!user) return;
    setSaving(true);

    try {
      // Update Firestore user document
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        name: data.name,
        phone: data.phone,
        city: data.city,
        pincode: data.pincode,
        ...(user.role === "provider" && {
          bio: data.bio || "",
          experience: data.experience || 0,
        }),
      });

      // Update Firebase Auth displayName
      await updateAuthProfile(auth.currentUser!, { displayName: data.name });

      alert("Profile updated successfully! 🎉");
      // Refresh auth context (optional: you can add a refresh function in useAuth later)
      if (typeof window !== "undefined") {
        window.location.reload();
      }
    } catch (error) {
      console.error(error);
      alert("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (!user) return <div className="py-20 text-center">Loading profile...</div>;

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <div className="flex items-center gap-4 mb-10">
        <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center text-3xl">
          👤
        </div>
        <div>
          <h1 className="text-4xl font-bold">Edit Profile</h1>
          <p className="text-gray-600">Keep your information up to date</p>
        </div>
      </div>

      {/* Profile Photo Section */}
      <div className="bg-white border rounded-3xl p-10 mb-10">
        <div className="flex flex-col items-center">
          <div className="relative w-40 h-40 rounded-full overflow-hidden border-4 border-orange-200 mb-6">
            {photoURL || user.photoURL ? (
              <Image
                src={photoURL || user.photoURL || ""}
                alt="Profile"
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <User className="w-20 h-20 text-gray-400" />
              </div>
            )}
          </div>

          <label className="cursor-pointer flex items-center gap-3 bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 rounded-2xl font-medium transition">
            <Camera className="w-5 h-5" />
            {uploading
              ? `Uploading... ${uploadProgress}%`
              : "Change Profile Photo"}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </label>

          {uploading && (
            <div className="w-full max-w-xs bg-gray-200 h-2 rounded-full mt-4 overflow-hidden">
              <div
                className="bg-orange-600 h-2 transition-all"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white border rounded-3xl p-10 space-y-8"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">Full Name</label>
            <input
              {...register("name")}
              type="text"
              className="w-full p-4 border rounded-2xl focus:outline-none focus:border-orange-500"
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Phone Number
            </label>
            <input
              {...register("phone")}
              type="tel"
              className="w-full p-4 border rounded-2xl focus:outline-none focus:border-orange-500"
            />
            {errors.phone && (
              <p className="text-red-500 text-sm mt-1">
                {errors.phone.message}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">City</label>
            <input
              {...register("city")}
              type="text"
              className="w-full p-4 border rounded-2xl focus:outline-none focus:border-orange-500"
              placeholder="Lucknow"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Pincode</label>
            <input
              {...register("pincode")}
              type="text"
              maxLength={6}
              className="w-full p-4 border rounded-2xl focus:outline-none focus:border-orange-500"
            />
            {errors.pincode && (
              <p className="text-red-500 text-sm mt-1">
                {errors.pincode.message}
              </p>
            )}
          </div>
        </div>

        {/* Provider-only fields */}
        {user.role === "provider" && (
          <>
            <div>
              <label className="block text-sm font-medium mb-2">
                Bio / About Me
              </label>
              <textarea
                {...register("bio")}
                rows={4}
                className="w-full p-4 border rounded-2xl focus:outline-none focus:border-orange-500"
                placeholder="Experienced plumber with 5+ years in residential and commercial work..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Years of Experience
              </label>
              <input
                {...register("experience", { valueAsNumber: true })}
                type="number"
                className="w-full p-4 border rounded-2xl focus:outline-none focus:border-orange-500"
                min="0"
              />
            </div>
          </>
        )}

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white font-semibold py-5 rounded-2xl text-lg flex items-center justify-center gap-3 transition"
        >
          <Save className="w-5 h-5" />
          {saving ? "Saving Changes..." : "Save Profile"}
        </button>
      </form>

      <div className="text-center mt-8 text-sm text-gray-500">
        Role: <span className="capitalize font-medium">{user.role}</span>
      </div>
    </div>
  );
}
