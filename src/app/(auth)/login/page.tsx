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
  const [showResetPasswordForm, setShowResetPasswordForm] = useState(false);
  const [isResetCodeVerified, setIsResetCodeVerified] = useState(false);
  const [otp, setOtp] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [userPhone, setUserPhone] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  // Separate states for password visibility
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const EyeIcon = ({ isVisible, toggle }: { isVisible: boolean; toggle: () => void }) => (
    <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-black hover:text-gray-700" onClick={toggle}>
      {isVisible ? (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="black"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="black"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.477 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" /></svg>
      )}
    </button>
  );

  const onSubmit = async (data: FormData) => {
    setError(null);
    try {
      const res = await api.post("/auth/login", data);
      if (res.data && res.data.phone) {
        setUserPhone(res.data.phone);
      }
      setShowOtpField(true);
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { detail?: string } } }).response?.data?.detail ?? "Login failed. Check your credentials.";
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
      setShowResetPasswordForm(true);
    } catch (err: unknown) {
      setError("Failed to send reset code.");
    }
  };

  const handleVerifyResetCode = () => {
    if (!resetCode) {
      setError("Please enter the reset code.");
      return;
    }
    setIsResetCodeVerified(true);
    setError(null);
  };

  const handleResetPassword = async () => {
    setError(null);
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    try {
      await api.post("/auth/reset-password", {
        email: getValues("email"),
        code: resetCode,
        new_password: newPassword,
      });
      alert("Password updated successfully!");
      setShowResetPasswordForm(false);
      setIsResetCodeVerified(false);
      setResetCode("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: unknown) {
      setError("Failed to reset password. Please check your code.");
    }
  };

  const handleVerifyOtp = async () => {
    setError(null);
    try {
      const res = await api.post<TokenResponse>("/auth/verify-otp", { 
        phone: userPhone, 
        otp: otp 
      });

      const { access_token, refresh_token } = res.data;
      const userRes = await api.get<User>("/auth/me", {
        headers: { Authorization: `Bearer ${access_token}` }
      });

      setAuth(userRes.data, access_token, refresh_token);
      router.push("/chat");
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { detail?: string } } }).response?.data?.detail ?? "Invalid OTP. Please try again.";
      setError(message);
    }
  };

  return (
    <div className="fixed inset-0 flex bg-cixio-dark">
      {/* Left side: Branding */}
      <div className="hidden lg:flex flex-col items-center justify-center w-1/2 bg-gradient-to-br from-cixio-navy via-cixio-dark to-[#060F3A] p-12 relative overflow-hidden h-full">
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

      {/* Right side: Form centered */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 bg-cixio-bg h-full overflow-y-auto">
        <div className="w-full max-w-md my-auto py-10">
          <div className="flex justify-center mb-8 lg:hidden">
            <img src="/cixio-logo.png" alt="Cixio" className="h-10 w-auto" />
          </div>

          <div className="card-cixio p-8 shadow-xl">
            <h1 className="text-2xl font-bold mb-1 text-cixio-dark">
              {showOtpField ? "Verify OTP" : showResetPasswordForm ? "Set New Password" : showForgotPassword ? "Reset Password" : "Welcome back"}
            </h1>
            <p className="text-sm text-gray-500 mb-6">
              {showOtpField ? "Enter the code sent to your phone" : showForgotPassword ? "Enter your email to receive a reset code" : "Sign in to your CixioHub account"}
            </p>

            {!showOtpField && !showForgotPassword && !showResetPasswordForm ? (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-1.5 text-gray-700">Email</label>
                  <input {...register("email")} type="email" placeholder="you@tkmce.ac.in" className="input-cixio" />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-sm font-semibold text-gray-700">Password</label>
                    <button type="button" onClick={() => setShowForgotPassword(true)} className="text-xs text-cixio-blue hover:underline">Forgot password?</button>
                  </div>
                  <div className="relative">
                    <input {...register("password")} type={showPassword ? "text" : "password"} placeholder="••••••••" className="input-cixio pr-10" />
                    <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-black hover:text-gray-700" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="black"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="black"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.477 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" /></svg>
                      )}
                    </button>
                  </div>
                  {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
                </div>
                {error && <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2"><p className="text-red-600 text-sm">{error}</p></div>}
                <button type="submit" disabled={isSubmitting} className="btn-cixio w-full mt-2">{isSubmitting ? "Signing in…" : "Sign in"}</button>
              </form>
            ) : showResetPasswordForm ? (
              <div className="space-y-4">
                {!isResetCodeVerified ? (
                  <>
                    <input type="text" placeholder="Enter Reset Code" className="input-cixio" value={resetCode} onChange={(e) => setResetCode(e.target.value)} />
                    <button onClick={handleVerifyResetCode} className="btn-cixio w-full">Verify Code</button>
                  </>
                ) : (
                  <>
                    <div className="relative">
                      <input type={showNewPassword ? "text" : "password"} placeholder="New Password" className="input-cixio pr-10" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                      <EyeIcon isVisible={showNewPassword} toggle={() => setShowNewPassword(!showNewPassword)} />
                    </div>
                    <div className="relative">
                      <input type={showConfirmPassword ? "text" : "password"} placeholder="Confirm Password" className="input-cixio pr-10" value={confirmPassword} onChange={(e) => setNewPassword(e.target.value)} />
                      <EyeIcon isVisible={showConfirmPassword} toggle={() => setShowConfirmPassword(!showConfirmPassword)} />
                    </div>
                    <button onClick={handleResetPassword} className="btn-cixio w-full">Update Password</button>
                  </>
                )}
                {error && <p className="text-red-500 text-xs">{error}</p>}
              </div>
            ) : showForgotPassword ? (
              <div className="space-y-4">
                <button onClick={handleForgotPassword} className="btn-cixio w-full">Send Reset Code</button>
                <button onClick={() => setShowForgotPassword(false)} className="text-sm text-gray-500 w-full hover:underline">Back to login</button>
              </div>
            ) : (
              <div className="space-y-4">
                <input type="text" placeholder="Enter OTP" className="input-cixio" value={otp} onChange={(e) => setOtp(e.target.value)} />
                {error && <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2"><p className="text-red-600 text-sm">{error}</p></div>}
                <button onClick={handleVerifyOtp} className="btn-cixio w-full mt-2">Confirm OTP</button>
              </div>
            )}

            {!showOtpField && !showForgotPassword && !showResetPasswordForm && (
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