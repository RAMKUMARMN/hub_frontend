"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import type { TokenResponse, User } from "@/types";

const schema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [error, setError] = useState<string | null>(null);
  const [showOtpField, setShowOtpField] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [otp, setOtp] = useState("");
  const [userPhone, setUserPhone] = useState(""); // State to store phone number

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setError(null);
    try {
      // 1. First step: login to trigger OTP
      // We assume your backend /login returns the user's phone number
      const res = await api.post("/auth/login", data);
      
      // Store the phone number returned from backend to use in verification
      if (res.data && res.data.phone) {
        setUserPhone(res.data.phone);
      }
      
      // If successful, show OTP field
      setShowOtpField(true);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { detail?: string } } }).response?.data?.detail ??
        "Login failed. Check your credentials.";
      setError(message);
    }
  };

  const handleForgotPassword = async () => {
    setError(null);
    const email = getValues("email");
    if (!email) {
      setError("Please enter your email address first.");
      return;
    }
    try {
      await api.post("/auth/forgot-password", { email });
      alert("Reset code sent! Please check your phone.");
      setShowForgotPassword(false);
    } catch (err: unknown) {
      setError("Failed to send reset code.");
    }
  };

  const handleVerifyOtp = async () => {
    setError(null);
    try {
      // 2. Second step: verify OTP and get tokens
      const res = await api.post<TokenResponse>("/auth/verify-otp", { 
        phone: userPhone, // Use the stored phone number instead of email
        otp: otp 
      });

      const { access_token, refresh_token } = res.data;

      // Fetch current user profile
      const userRes = await api.get<User>("/auth/me", {
        headers: { Authorization: `Bearer ${access_token}` }
      });

      setAuth(userRes.data, access_token, refresh_token);
      router.push("/chat");
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { detail?: string } } }).response?.data?.detail ??
        "Invalid OTP. Please try again.";
      setError(message);
    }
  };

  return (
    <div className="min-h-screen flex bg-cixio-dark">
      {/* Left panel — brand */}
      <div className="hidden lg:flex flex-col items-center justify-center w-1/2 bg-gradient-to-br from-cixio-navy via-cixio-dark to-[#060F3A] p-12 relative overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute top-[-80px] left-[-80px] w-80 h-80 rounded-full bg-cixio-blue/20 blur-3xl" />
        <div className="absolute bottom-[-60px] right-[-60px] w-64 h-64 rounded-full bg-cixio-blue/15 blur-3xl" />
        <img src="/cixio-logo-white.png" alt="Cixio" className="w-56 mb-10 relative z-10" />
        <h2 className="text-white text-3xl font-bold text-center mb-4 relative z-10 leading-tight">
          AI-powered platform<br />for TKM students
        </h2>
        <p className="text-cixio-light/60 text-center text-sm max-w-xs relative z-10 leading-relaxed">
          Chat with AI, manage documents, track todos — all in one intelligent workspace.
        </p>
      </div>

      {/* Right panel — form */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 bg-cixio-bg">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex justify-center mb-8 lg:hidden">
            <img src="/cixio-logo.png" alt="Cixio" className="h-10 w-auto" />
          </div>

          <div className="card-cixio p-8 shadow-xl">
            <h1 className="text-2xl font-bold mb-1 text-cixio-dark">
              {showOtpField ? "Verify OTP" : showForgotPassword ? "Reset Password" : "Welcome back"}
            </h1>
            <p className="text-sm text-gray-500 mb-6">
              {showOtpField ? "Enter the code sent to your phone" : showForgotPassword ? "Enter your email to receive a reset code" : "Sign in to your CixioHub account"}
            </p>

            {!showOtpField && !showForgotPassword ? (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-1.5 text-gray-700">Email</label>
                  <input
                    {...register("email")}
                    type="email"
                    placeholder="you@tkmce.ac.in"
                    className="input-cixio"
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-sm font-semibold text-gray-700">Password</label>
                    <button type="button" onClick={() => setShowForgotPassword(true)} className="text-xs text-cixio-blue hover:underline">Forgot password?</button>
                  </div>
                  <input
                    {...register("password")}
                    type="password"
                    placeholder="••••••••"
                    className="input-cixio"
                  />
                  {errors.password && (
                    <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
                  )}
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-cixio w-full mt-2"
                >
                  {isSubmitting ? "Signing in…" : "Sign in"}
                </button>
              </form>
            ) : showForgotPassword ? (
              <div className="space-y-4">
                <button onClick={handleForgotPassword} className="btn-cixio w-full">Send Reset Code</button>
                <button onClick={() => setShowForgotPassword(false)} className="text-sm text-gray-500 w-full hover:underline">Back to login</button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-1.5 text-gray-700">Enter OTP</label>
                  <input
                    type="text"
                    placeholder="Enter OTP"
                    className="input-cixio"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                  />
                </div>
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                )}
                <button
                  onClick={handleVerifyOtp}
                  className="btn-cixio w-full mt-2"
                >
                  Confirm OTP
                </button>
              </div>
            )}

            {!showOtpField && !showForgotPassword && (
              <p className="text-center text-sm mt-5 text-gray-500">
                Don&apos;t have an account?{" "}
                <Link href="/register" className="text-cixio-blue font-medium hover:text-cixio-navy transition-colors">
                  Create one
                </Link>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}