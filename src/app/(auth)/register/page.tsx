"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import type { TokenResponse } from "@/types";

const schema = z
  .object({
    full_name: z.string().min(2, "Name is required"),
    email: z.string().email("Invalid email"),
    phone: z.string().optional(),
    password: z
      .string()
      .min(8, "Must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain an uppercase letter")
      .regex(/[0-9]/, "Must contain a number")
      .regex(/[^A-Za-z0-9]/, "Must contain a special character"),
    confirm_password: z.string(),
    otp: z.string().optional(),
    email_otp: z.string().optional(),
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
  
  const [emailOtp, setEmailOtp] = useState("");
  const [isEmailVerifying, setIsEmailVerifying] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [showEmailOtpField, setShowEmailOtpField] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const phoneValue = watch("phone");
  const emailValue = watch("email");
  const password = watch("password") || "";

  const requirements = [
    { regex: /.{8,}/, text: "At least 8 characters" },
    { regex: /[A-Z]/, text: "Include an uppercase letter" },
    { regex: /[0-9]/, text: "Include a number" },
    { regex: /[^A-Za-z0-9]/, text: "Include a special character" },
  ];

  const allMet = requirements.every((req) => req.regex.test(password));
  const isNotEmpty = password.length > 0;

  const EyeIcon = ({ isVisible, toggle }: { isVisible: boolean; toggle: () => void }) => (
    <button type="button" className="absolute right-3 top-[38px] text-black hover:opacity-70" onClick={toggle}>
      {isVisible ? (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
      )}
    </button>
  );

  const handleSendEmailOtp = async () => {
    if (!emailValue) return setError("Please enter an email first.");
    setIsEmailVerifying(true);
    setError(null);
    try {
      await api.post("/auth/email_verification", { email: emailValue });
      setShowEmailOtpField(true);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to send email OTP");
    } finally {
      setIsEmailVerifying(false);
    }
  };

  const handleVerifyEmailOtp = async (otpValue: string) => {
    try {
      await api.post("/auth/verify-email-otp", { email: emailValue, otp: otpValue });
      setIsEmailVerified(true);
      setShowEmailOtpField(false);
      setValue("email_otp", otpValue);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Invalid Email OTP");
    }
  };

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
<<<<<<< HEAD
      await api.post("/auth/verify-phoneno-and-register", { phone: phoneValue, otp: otpValue });
=======
      await api.post("/auth/verify-registration-otp", { 
        phone: phoneValue, 
        otp: otpValue 
      });
>>>>>>> c2a2dcb (complete rag pipeline integration, new chat sidebar  and docker support)
      setIsVerified(true);
      setShowOtpField(false);
      setValue("otp", otpValue);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Invalid OTP");
    }
  };

  const onSubmit = async (data: FormData) => {
    if (!isVerified) return setError("Please verify your phone number first.");
    if (!isEmailVerified) return setError("Please verify your email first.");
    
    setError(null);
    try {
      await api.post<TokenResponse>("/auth/register", {
        email: data.email,
        password: data.password,
        full_name: data.full_name,
        phone: data.phone,
        otp: data.otp,
      });
      router.push("/login");
    } catch (err: any) {
      const message = err.response?.data?.detail || 
                      (typeof err === 'string' ? err : "Registration failed.");
      setError(message);
    }
  };

  return (
    <div className="h-screen w-full flex overflow-hidden bg-cixio-bg">
      <div className="hidden lg:flex flex-col items-center justify-start pt-24 w-1/2 bg-gradient-to-br from-cixio-navy via-cixio-dark to-[#060F3A] p-12 relative overflow-hidden shrink-0 h-screen">
        <div className="absolute top-[-80px] left-[-80px] w-80 h-80 rounded-full bg-cixio-blue/20 blur-3xl" />
        <div className="absolute bottom-[-60px] right-[-60px] w-64 h-64 rounded-full bg-cixio-blue/15 blur-3xl" />
        <img src="/cixio-logo-white.png" alt="Cixio" className="w-56 mb-10 relative z-10" />
        <h2 className="text-white text-3xl font-bold text-center mb-4 relative z-10 leading-tight">Join CixioHub today</h2>
        <p className="text-cixio-light/60 text-center text-sm max-w-xs relative z-10 leading-relaxed">Your intelligent AI workspace. Get started in seconds.</p>
      </div>

      <div className="flex-1 h-screen overflow-y-auto flex flex-col items-center pt-20 pb-10 px-6">
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
                <div className="flex gap-2">
                  <input {...register("email")} type="email" placeholder="you@tkmce.ac.in" className="input-cixio" disabled={isEmailVerified} />
                  {!isEmailVerified && (
                    <button type="button" onClick={handleSendEmailOtp} disabled={isEmailVerifying} className="btn-cixio whitespace-nowrap text-sm">
                      {isEmailVerifying ? "Sending..." : "Verify"}
                    </button>
                  )}
                  {isEmailVerified && <span className="text-green-600 font-bold flex items-center whitespace-nowrap">✓ Verified</span>}
                </div>
              </div>

              {showEmailOtpField && (
                <div>
                  <input type="text" placeholder="Enter Email OTP" className="input-cixio" value={emailOtp} onChange={(e) => setEmailOtp(e.target.value)} />
                  <button type="button" onClick={() => handleVerifyEmailOtp(emailOtp)} className="btn-cixio w-full mt-2">Confirm Email OTP</button>
                </div>
              )}

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
                  <input type="text" placeholder="Enter Phone OTP" className="input-cixio" value={otp} onChange={(e) => setOtp(e.target.value)} />
                  <button type="button" onClick={() => handleVerifyOtp(otp)} className="btn-cixio w-full mt-2">Confirm Phone OTP</button>
                </div>
              )}

              <div className="relative">
                <label className="block text-sm font-semibold mb-1.5 text-gray-700">Password</label>
                <input 
                  {...register("password")} 
                  type={showPassword ? "text" : "password"} 
                  placeholder="••••••••" 
                  className="input-cixio w-full" 
                />
                <EyeIcon isVisible={showPassword} toggle={() => setShowPassword(!showPassword)} />
                
                <div className={`mt-2 p-3 rounded-lg border-2 transition-colors ${
                  !isNotEmpty ? "border-gray-200" : allMet ? "border-green-500" : "border-red-500"
                }`}>
                  <ul className="space-y-1">
                    {requirements.map((req, index) => {
                      const isValid = req.regex.test(password);
                      return (
                        <li key={index} className={`text-xs flex items-center ${isValid ? "text-green-600" : "text-red-500"}`}>
                          <span className="mr-2">{isValid ? "✓" : "✕"}</span>
                          {req.text}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
              
              <div className="relative">
                <label className="block text-sm font-semibold mb-1.5 text-gray-700">Confirm Password</label>
                <input {...register("confirm_password")} type={showConfirmPassword ? "text" : "password"} placeholder="••••••••" className="input-cixio w-full" />
                <EyeIcon isVisible={showConfirmPassword} toggle={() => setShowConfirmPassword(!showConfirmPassword)} />
              </div>

              {error && <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2"><p className="text-red-600 text-sm">{error}</p></div>}

              <button type="submit" disabled={isSubmitting || !isVerified || !isEmailVerified} className="btn-cixio w-full mt-2">
                {isSubmitting ? "Creating account…" : "Create account"}
              </button>
            </form>

            <p className="text-center text-sm mt-5 text-gray-500">
              Already have an account?{" "}
              <Link href="/login" className="text-cixio-blue font-medium hover:text-cixio-navy transition-colors">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}