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

const schema = z
  .object({
    full_name: z.string().min(2, "Name is required"),
    email: z.string().email("Invalid email"),
    phone: z.string().optional(),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirm_password: z.string(),
    otp: z.string().optional(),
  })
  .refine((d) => d.password === d.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  });

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [error, setError] = useState<string | null>(null);
  const [otp, setOtp] = useState(""); 
  
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [showOtpField, setShowOtpField] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const phoneValue = watch("phone");

  const handleSendOtp = async () => {
    if (!phoneValue) return setError("Please enter a phone number first.");
    setIsVerifying(true);
    setError(null);
    try {
      await api.post("/auth/phone_number_verification", { phone: phoneValue });
      setShowOtpField(true);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to send OTP");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleVerifyOtp = async (otpValue: string) => {
    try {
      await api.post("/auth/verify-phoneno-and-register", { 
        phone: phoneValue, 
        otp: otpValue 
      });
      setIsVerified(true);
      setShowOtpField(false);
      setValue("otp", otpValue);
    } catch (err: any) {
      const message = err.response?.data?.detail || "Invalid OTP";
      setError(typeof message === 'string' ? message : JSON.stringify(message));
    }
  };

  const onSubmit = async (data: FormData) => {
    if (!isVerified) return setError("Please verify your phone number first.");
    
    setError(null);
    try {
      // 1. Register returns the tokens directly now
      await api.post<TokenResponse>("/auth/register", {
        email: data.email,
        password: data.password,
        full_name: data.full_name,
        phone: data.phone,
        otp: data.otp,
      });

      // 2. Redirect to login page after successful registration
      router.push("/login");
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { detail?: string } } }).response?.data?.detail ??
        "Registration failed. Please try again.";
      setError(message);
    }
  };

  return (
    <div className="min-h-screen flex bg-cixio-dark">
      <div className="hidden lg:flex flex-col items-center justify-center w-1/2 bg-gradient-to-br from-cixio-navy via-cixio-dark to-[#060F3A] p-12 relative overflow-hidden">
        <div className="absolute top-[-80px] left-[-80px] w-80 h-80 rounded-full bg-cixio-blue/20 blur-3xl" />
        <div className="absolute bottom-[-60px] right-[-60px] w-64 h-64 rounded-full bg-cixio-blue/15 blur-3xl" />
        <img src="/cixio-logo-white.png" alt="Cixio" className="w-56 mb-10 relative z-10" />
        <h2 className="text-white text-3xl font-bold text-center mb-4 relative z-10 leading-tight">
          Join CixioHub today
        </h2>
        <p className="text-cixio-light/60 text-center text-sm max-w-xs relative z-10 leading-relaxed">
          Your intelligent AI workspace. Get started in seconds.
        </p>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center px-6 bg-cixio-bg py-10">
        <div className="w-full max-w-md">
          <div className="flex justify-center mb-8 lg:hidden">
            <img src="/cixio-logo.png" alt="Cixio" className="h-10 w-auto" />
          </div>

          <div className="card-cixio p-8 shadow-xl">
            <h1 className="text-2xl font-bold mb-1 text-cixio-dark">Create account</h1>
            <p className="text-sm text-gray-500 mb-6">Join CixioHub — TKM&apos;s AI platform</p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1.5 text-gray-700">Full Name</label>
                <input {...register("full_name")} type="text" placeholder="John Doe" className="input-cixio" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5 text-gray-700">Email</label>
                <input {...register("email")} type="email" placeholder="you@tkmce.ac.in" className="input-cixio" />
              </div>
              
              <div>
                <label className="block text-sm font-semibold mb-1.5 text-gray-700">Phone</label>
                <div className="flex gap-2">
                  <input {...register("phone")} type="tel" placeholder="+91 98765 43210" className="input-cixio" disabled={isVerified} />
                  {!isVerified && (
                    <button type="button" onClick={handleSendOtp} disabled={isVerifying} className="btn-cixio whitespace-nowrap text-sm">
                      {isVerifying ? "Sending..." : "Verify"}
                    </button>
                  )}
                  {isVerified && <span className="text-green-600 font-bold flex items-center whitespace-nowrap">✓ Verified</span>}
                </div>
              </div>

              {showOtpField && (
                <div>
                  <label className="block text-sm font-semibold mb-1.5 text-gray-700">Enter OTP</label>
                  <input type="text" placeholder="Enter OTP" className="input-cixio" value={otp} onChange={(e) => setOtp(e.target.value)} />
                  <button type="button" onClick={() => handleVerifyOtp(otp)} className="btn-cixio w-full mt-2">Confirm OTP</button>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold mb-1.5 text-gray-700">Password</label>
                <input {...register("password")} type="password" placeholder="••••••••" className="input-cixio" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5 text-gray-700">Confirm Password</label>
                <input {...register("confirm_password")} type="password" placeholder="••••••••" className="input-cixio" />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting || !isVerified}
                className="btn-cixio w-full mt-2"
              >
                {isSubmitting ? "Creating account…" : "Create account"}
              </button>
            </form>

            <p className="text-center text-sm mt-5 text-gray-500">
              Already have an account?{" "}
              <Link href="/login" className="text-cixio-blue font-medium hover:text-cixio-navy transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}