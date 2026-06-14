"use client";

import Link from "next/link";
import { Loader2, LogIn } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import AuthShell from "@/components/auth/AuthShell";
import AuthTextField from "@/components/auth/AuthTextField";

const loginSchema = z.object({
  email: z.string().trim().min(1, "Email is required").email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    // TODO: Replace this console log with the backend login integration.
    console.log("Login form data", data);
    await new Promise((resolve) => setTimeout(resolve, 500));
  };

  return (
    <AuthShell
      eyebrow="Secure access"
      title="Welcome back to CixioHub"
      subtitle="Sign in to continue into your AI workspace for chats, documents, queues, and todos."
      footerText="Don't have an account?"
      footerHref="/register"
      footerLink="Register"
    >
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-cixio-dark dark:text-white">Login</h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-cixio-light/65">
          Use your account email and password.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <AuthTextField
          id="login-email"
          label="Email"
          type="email"
          placeholder="you@tkmce.ac.in"
          autoComplete="email"
          error={errors.email?.message}
          registration={register("email")}
        />

        <AuthTextField
          id="login-password"
          label="Password"
          type="password"
          placeholder="Enter your password"
          autoComplete="current-password"
          error={errors.password?.message}
          registration={register("password")}
        />

        <div className="flex justify-end">
          <Link
            href="#"
            className="text-sm font-medium text-cixio-blue transition-colors hover:text-cixio-navy focus:outline-none focus:ring-2 focus:ring-cixio-blue focus:ring-offset-2 dark:text-blue-300 dark:hover:text-white dark:focus:ring-offset-[#0B1730]"
            aria-label="Forgot password placeholder"
          >
            Forgot password?
          </Link>
        </div>

        <button type="submit" disabled={isSubmitting} className="btn-cixio flex w-full items-center justify-center gap-2">
          {isSubmitting ? (
            <>
              <Loader2 size={18} className="animate-spin" aria-hidden="true" />
              Logging in...
            </>
          ) : (
            <>
              <LogIn size={18} aria-hidden="true" />
              Login
            </>
          )}
        </button>
      </form>
    </AuthShell>
  );
}
