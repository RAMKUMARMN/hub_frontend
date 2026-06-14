"use client";

import { Loader2, UserPlus } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import AuthShell from "@/components/auth/AuthShell";
import AuthTextField from "@/components/auth/AuthTextField";

const registerSchema = z
  .object({
    fullName: z.string().trim().min(2, "Full name must be at least 2 characters"),
    email: z.string().trim().min(1, "Email is required").email("Enter a valid email address"),
    phone: z.string().trim().optional(),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords must match",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    // TODO: Replace this console log with the backend registration integration.
    console.log("Register form data", data);
    await new Promise((resolve) => setTimeout(resolve, 500));
  };

  return (
    <AuthShell
      eyebrow="Create workspace access"
      title="Start using CixioHub"
      subtitle="Create an account for the CixioHub dashboard and keep your workspace ready across devices."
      footerText="Already have an account?"
      footerHref="/login"
      footerLink="Login"
    >
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-cixio-dark dark:text-white">Create account</h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-cixio-light/65">
          Enter your details to set up your account.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <AuthTextField
          id="register-full-name"
          label="Full name"
          type="text"
          placeholder="John Doe"
          autoComplete="name"
          error={errors.fullName?.message}
          registration={register("fullName")}
        />

        <AuthTextField
          id="register-email"
          label="Email"
          type="email"
          placeholder="you@tkmce.ac.in"
          autoComplete="email"
          error={errors.email?.message}
          registration={register("email")}
        />

        <AuthTextField
          id="register-phone"
          label="Phone (optional)"
          type="tel"
          placeholder="+91 98765 43210"
          autoComplete="tel"
          error={errors.phone?.message}
          registration={register("phone")}
        />

        <AuthTextField
          id="register-password"
          label="Password"
          type="password"
          placeholder="At least 8 characters"
          autoComplete="new-password"
          error={errors.password?.message}
          registration={register("password")}
        />

        <AuthTextField
          id="register-confirm-password"
          label="Confirm password"
          type="password"
          placeholder="Re-enter your password"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          registration={register("confirmPassword")}
        />

        <button type="submit" disabled={isSubmitting} className="btn-cixio flex w-full items-center justify-center gap-2">
          {isSubmitting ? (
            <>
              <Loader2 size={18} className="animate-spin" aria-hidden="true" />
              Creating account...
            </>
          ) : (
            <>
              <UserPlus size={18} aria-hidden="true" />
              Create account
            </>
          )}
        </button>
      </form>
    </AuthShell>
  );
}
