"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api, { buildApiUrl } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import type { TokenResponse, User } from "@/types";

const schema = z
  .object({
    full_name: z.string().min(2, "Name is required"),
    email: z.string().email("Invalid email"),
    phone: z.string().optional(),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirm_password: z.string(),
  })
  .refine((d) => d.password === d.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  });

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const setTokens = useAuthStore((s) => s.setTokens);
  
  const [step, setStep] = useState<"register" | "otp" | "approval">("register");
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [registeredPassword, setRegisteredPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  // OTP inputs & states
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [resendStatus, setResendStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [resendError, setResendError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setError(null);
    try {
      // Register
      await api.post(buildApiUrl("/auth/register"), {
        email: data.email,
        password: data.password,
        full_name: data.full_name,
        phone: data.phone || undefined,
      });

      setRegisteredEmail(data.email);
      setRegisteredPassword(data.password);
      setStep("otp");
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { detail?: string } } }).response?.data?.detail ??
        "Registration failed. Please try again.";
      setError(message);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setOtpError("Please enter a 6-digit code");
      return;
    }
    setOtpError(null);
    setIsVerifying(true);
    try {
      await api.post(buildApiUrl("/auth/verify-otp"), {
        email: registeredEmail,
        otp: otp,
      });

      const isInstitutional = registeredEmail.toLowerCase().endsWith("@tkmce.ac.in");

      if (isInstitutional) {
        // Auto-login for institutional accounts
        const tokenRes = await api.post<TokenResponse>(buildApiUrl("/auth/login"), {
          email: registeredEmail,
          password: registeredPassword,
        });
        const { access_token, refresh_token } = tokenRes.data;
        setTokens(access_token, refresh_token);
        const userRes = await api.get<User>(buildApiUrl("/auth/me"));
        setAuth(userRes.data, access_token, refresh_token);
        router.push("/dashboard");
      } else {
        // Route non-institutional to approval success screen
        setStep("approval");
      }
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { detail?: string } } }).response?.data?.detail ??
        "OTP verification failed. Please try again.";
      setOtpError(message);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOtp = async () => {
    setResendStatus("sending");
    setResendError(null);
    try {
      await api.post(buildApiUrl("/auth/resend-otp"), {
        email: registeredEmail,
      });
      setResendStatus("success");
      setTimeout(() => setResendStatus("idle"), 5000);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { detail?: string } } }).response?.data?.detail ??
        "Failed to resend code.";
      setResendStatus("error");
      setResendError(message);
    }
  };

  return (
    <div className="min-h-screen flex bg-cixio-dark">
      {/* Left panel */}
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

      {/* Right panel */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 bg-cixio-bg py-10">
        <div className="w-full max-w-md">
          <div className="flex justify-center mb-8 lg:hidden">
            <img src="/cixio-logo.png" alt="Cixio" className="h-10 w-auto" />
          </div>

          <div className="card-cixio p-8 shadow-xl">
            {step === "register" && (
              <>
                <h1 className="text-2xl font-bold mb-1 text-cixio-dark">Create account</h1>
                <p className="text-sm text-gray-500 mb-6">Join CixioHub — TKM&apos;s AI platform</p>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  {[
                    { label: "Full Name", name: "full_name", type: "text", placeholder: "John Doe" },
                    { label: "Email", name: "email", type: "email", placeholder: "you@tkmce.ac.in" },
                    { label: "Phone (optional)", name: "phone", type: "tel", placeholder: "+91 98765 43210" },
                    { label: "Password", name: "password", type: "password", placeholder: "••••••••" },
                    { label: "Confirm Password", name: "confirm_password", type: "password", placeholder: "••••••••" },
                  ].map(({ label, name, type, placeholder }) => (
                    <div key={name}>
                      <label className="block text-sm font-semibold mb-1.5 text-gray-700">{label}</label>
                      <input
                        {...register(name as keyof FormData)}
                        type={type}
                        placeholder={placeholder}
                        className="input-cixio"
                      />
                      {errors[name as keyof FormData] && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors[name as keyof FormData]?.message}
                        </p>
                      )}
                    </div>
                  ))}

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
                    {isSubmitting ? "Creating account…" : "Create account"}
                  </button>
                </form>

                <p className="text-center text-sm mt-5 text-gray-500">
                  Already have an account?{" "}
                  <Link href="/auth/login" className="text-cixio-blue font-medium hover:text-cixio-navy transition-colors">
                    Sign in
                  </Link>
                </p>
              </>
            )}

            {step === "otp" && (
              <>
                <h1 className="text-2xl font-bold mb-2 text-cixio-dark">Verify your email</h1>
                <p className="text-sm text-gray-500 mb-6">
                  We&apos;ve sent a 6-digit verification code to <span className="font-semibold text-cixio-dark">{registeredEmail}</span>.
                </p>

                <form onSubmit={handleVerifyOtp} className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold mb-1.5 text-gray-700">Verification Code</label>
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="123456"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                      className="input-cixio text-center text-xl tracking-[0.5em] font-mono py-3"
                    />
                    {otpError && (
                      <p className="text-red-500 text-xs mt-1.5">{otpError}</p>
                    )}
                  </div>

                  {resendStatus === "success" && (
                    <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                      <p className="text-green-700 text-sm">Code resent successfully!</p>
                    </div>
                  )}

                  {resendStatus === "error" && resendError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                      <p className="text-red-600 text-sm">{resendError}</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isVerifying}
                    className="btn-cixio w-full"
                  >
                    {isVerifying ? "Verifying..." : "Verify & Continue"}
                  </button>
                </form>

                <div className="mt-6 flex flex-col items-center justify-center space-y-3 text-sm">
                  <button
                    onClick={handleResendOtp}
                    disabled={resendStatus === "sending"}
                    className="text-cixio-blue font-medium hover:text-cixio-navy transition-colors disabled:opacity-50"
                  >
                    {resendStatus === "sending" ? "Resending..." : "Resend verification code"}
                  </button>

                  <button
                    onClick={() => setStep("register")}
                    className="text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    Back to sign up
                  </button>
                </div>
              </>
            )}

            {step === "approval" && (
              <div className="text-center py-4">
                <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-full bg-blue-50 border border-blue-200 mb-5">
                  <svg className="h-7 w-7 text-cixio-blue animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                
                <h1 className="text-2xl font-bold mb-2 text-cixio-dark">Email verified!</h1>
                <p className="text-sm font-semibold text-cixio-blue mb-4">Pending Admin Approval</p>
                
                <p className="text-sm text-gray-600 mb-8 leading-relaxed max-w-sm mx-auto">
                  Your email has been verified successfully. Since this is a non-institutional account, an administrator needs to approve your registration before you can log in to CixioHub.
                </p>

                <Link
                  href="/auth/login"
                  className="btn-cixio inline-block w-full text-center"
                >
                  Go to Login
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
