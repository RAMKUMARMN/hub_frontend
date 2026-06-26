
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

const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const forgotPasswordSchema = z.object({
  email: z.string().email("Enter a valid email address"),
});

type LoginFormData = z.infer<typeof loginSchema>;
type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  const [error, setError] = useState<string | null>(null);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState<string | null>(null);

  const {
    register: registerLogin,
    handleSubmit: handleLoginSubmit,
    formState: {
      errors: loginErrors,
      isSubmitting: isLoggingIn,
    },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const {
    register: registerForgot,
    handleSubmit: handleForgotSubmit,
    formState: {
      errors: forgotErrors,
      isSubmitting: isSendingResetCode,
    },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  async function onLoginSubmit(data: LoginFormData) {
    setError(null);

    try {
      // POST http://localhost:8000/api/v1/auth/login
      const loginResponse = await api.post<TokenResponse>("/auth/login", data);

      const { access_token, refresh_token } = loginResponse.data;

      // Fetch the logged-in user's details using the new access token.
      const userResponse = await api.get<User>("/auth/me", {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      });

      // Save user + tokens in your Zustand auth store.
      setAuth(userResponse.data, access_token, refresh_token);

      // Redirect only after login and profile retrieval succeed.
      router.replace("/chat");
    } catch (err: unknown) {
      const message =
        (
          err as {
            response?: {
              data?: {
                detail?: string;
              };
            };
          }
        ).response?.data?.detail ??
        "Login failed. Check your email, password, and backend connection.";

      setError(message);
    }
  }

  async function onForgotPasswordSubmit(data: ForgotPasswordFormData) {
    setError(null);
    setForgotSuccess(null);

    try {
      await api.post("/auth/forgot-password", {
        email: data.email,
      });

      setForgotSuccess(
        "If this email is registered, a reset code has been sent to the linked phone number."
      );
    } catch {
      setError("Could not send the reset code. Please try again.");
    }
  }

  function returnToLogin() {
    setError(null);
    setForgotSuccess(null);
    setShowForgotPassword(false);
  }

  return (
    <div className="min-h-screen flex bg-cixio-dark">
      {/* Left panel — brand */}
      <div className="hidden lg:flex flex-col items-center justify-center w-1/2 bg-gradient-to-br from-cixio-navy via-cixio-dark to-[#060F3A] p-12 relative overflow-hidden">
        <div className="absolute top-[-80px] left-[-80px] w-80 h-80 rounded-full bg-cixio-blue/20 blur-3xl" />
        <div className="absolute bottom-[-60px] right-[-60px] w-64 h-64 rounded-full bg-cixio-blue/15 blur-3xl" />

        <img
          src="/cixio-logo-white.png"
          alt="Cixio"
          className="w-56 mb-10 relative z-10"
        />

        <h2 className="text-white text-3xl font-bold text-center mb-4 relative z-10 leading-tight">
          AI-powered platform
          <br />
          for TKM students
        </h2>

        <p className="text-cixio-light/60 text-center text-sm max-w-xs relative z-10 leading-relaxed">
          Chat with AI, manage documents, track todos — all in one intelligent
          workspace.
        </p>
      </div>

      {/* Right panel — form */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 bg-cixio-bg">
        <div className="w-full max-w-md">
          <div className="flex justify-center mb-8 lg:hidden">
            <img
              src="/cixio-logo.png"
              alt="Cixio"
              className="h-10 w-auto"
            />
          </div>

          <div className="card-cixio p-8 shadow-xl">
            <h1 className="text-2xl font-bold mb-1 text-cixio-dark">
              {showForgotPassword ? "Reset password" : "Welcome back"}
            </h1>

            <p className="text-sm text-gray-500 mb-6">
              {showForgotPassword
                ? "Enter your email address to receive a reset code."
                : "Sign in to your CixioHub account"}
            </p>

            {!showForgotPassword ? (
              <form
                onSubmit={handleLoginSubmit(onLoginSubmit)}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-semibold mb-1.5 text-gray-700">
                    Email
                  </label>

                  <input
                    {...registerLogin("email")}
                    type="email"
                    placeholder="you@tkmce.ac.in"
                    className="input-cixio"
                  />

                  {loginErrors.email && (
                    <p className="text-red-500 text-xs mt-1">
                      {loginErrors.email.message}
                    </p>
                  )}
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-sm font-semibold text-gray-700">
                      Password
                    </label>

                    <button
                      type="button"
                      onClick={() => {
                        setError(null);
                        setShowForgotPassword(true);
                      }}
                      className="text-xs text-cixio-blue hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>

                  <input
                    {...registerLogin("password")}
                    type="password"
                    placeholder="••••••••"
                    className="input-cixio"
                  />

                  {loginErrors.password && (
                    <p className="text-red-500 text-xs mt-1">
                      {loginErrors.password.message}
                    </p>
                  )}
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="btn-cixio w-full mt-2"
                >
                  {isLoggingIn ? "Signing in…" : "Sign in"}
                </button>
              </form>
            ) : (
              <form
                onSubmit={handleForgotSubmit(onForgotPasswordSubmit)}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-semibold mb-1.5 text-gray-700">
                    Email
                  </label>

                  <input
                    {...registerForgot("email")}
                    type="email"
                    placeholder="you@tkmce.ac.in"
                    className="input-cixio"
                  />

                  {forgotErrors.email && (
                    <p className="text-red-500 text-xs mt-1">
                      {forgotErrors.email.message}
                    </p>
                  )}
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                )}

                {forgotSuccess && (
                  <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                    <p className="text-green-700 text-sm">{forgotSuccess}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSendingResetCode}
                  className="btn-cixio w-full"
                >
                  {isSendingResetCode ? "Sending…" : "Send reset code"}
                </button>

                <button
                  type="button"
                  onClick={returnToLogin}
                  className="text-sm text-gray-500 w-full hover:underline"
                >
                  Back to login
                </button>
              </form>
            )}

            {!showForgotPassword && (
              <p className="text-center text-sm mt-5 text-gray-500">
                Don&apos;t have an account?{" "}
                <Link
                  href="/register"
                  className="text-cixio-blue font-medium hover:text-cixio-navy transition-colors"
                >
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

