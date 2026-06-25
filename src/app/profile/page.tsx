"use client";

import { useState } from "react";
import api from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  // Pull tokens directly from the store state
  const { user, accessToken, refreshToken, setAuth } = useAuthStore();
  const router = useRouter();

  const [formData, setFormData] = useState({
    full_name: user?.full_name || "",
    phone: user?.phone || "",
    email: user?.email || "",
  });
  
  const [loading, setLoading] = useState(false);

  // 1. Handle Updating Name 
  const handleUpdate = async () => {
    setLoading(true);
    try {
      const res = await api.put("/auth/profile", { full_name: formData.full_name });
      
      // Use the tokens directly from the store variables
      setAuth(res.data as any, accessToken || "", refreshToken || ""); 
      
      alert("Profile updated successfully!");
      router.push("/chat");
    } catch (err: any) {
      alert("Failed to update profile details.");
    } finally {
      setLoading(false);
    }
  };

  // 2. Handle Avatar Upload
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const data = new FormData();
    data.append("file", file);

    try {
      setLoading(true);
      const res = await api.post("/auth/avatar", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      
      // Use the tokens directly from the store variables
      setAuth(res.data as any, accessToken || "", refreshToken || ""); 
      
      alert("Avatar updated successfully!");
    } catch (err: any) {
      alert("Failed to upload avatar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cixio-bg p-8 flex justify-center items-center">
      <div className="w-full max-w-md card-cixio p-8 shadow-xl">
        <h1 className="text-2xl font-bold mb-6 text-cixio-dark">Profile Settings</h1>

        {/* Avatar Circle */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-28 h-28 rounded-full bg-cixio-blue flex items-center justify-center text-white text-4xl font-bold mb-4 overflow-hidden border-4 border-white shadow-lg">
             {user?.avatar_url ? (
               <img 
                 src={`http://localhost:8000/api/v1/auth/avatar/${user.id}?t=${new Date().getTime()}`} 
                 alt="Avatar" 
                 className="w-full h-full object-cover"
                 onError={(e) => {
                   e.currentTarget.style.display = 'none';
                 }}
               />
             ) : (
               user?.full_name?.charAt(0).toUpperCase()
             )}
          </div>
          <label className="cursor-pointer bg-cixio-navy text-white px-4 py-2 rounded-lg text-sm hover:bg-cixio-blue transition">
            {loading ? "Uploading..." : "Upload New Photo"}
            <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} />
          </label>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1">Email</label>
            <input className="input-cixio bg-gray-100 cursor-not-allowed" value={formData.email} disabled />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Full Name</label>
            <input className="input-cixio" value={formData.full_name} onChange={(e) => setFormData({...formData, full_name: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Phone</label>
            <input className="input-cixio bg-gray-100 cursor-not-allowed" value={formData.phone} disabled />
          </div>
          
          <button onClick={handleUpdate} disabled={loading} className="btn-cixio w-full mt-4">
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}