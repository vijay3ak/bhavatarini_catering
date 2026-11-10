"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowLeft,
  Loader2,
  Shield,
  HelpCircle,
  X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getSafeRedirectUrl } from "@/lib/auth/redirect";

interface ValidationErrors {
  email?: string;
  password?: string;
  general?: string;
}

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForgotNotice, setShowForgotNotice] = useState(false);

  // If already authenticated and active, redirect to target destination
  useEffect(() => {
    let isMounted = true;
    const searchParams = new URLSearchParams(window.location.search);
    const errorParam = searchParams.get("error");

    if (errorParam === "access_denied" || errorParam === "unauthorized_admin") {
      setErrors({
        general:
          "Access Denied: Your account is not registered as an active administrator. Please contact the Business Owner.",
      });
      try {
        const supabase = createClient();
        supabase.auth.signOut().catch(() => {});
      } catch {
        // Environment unconfigured; remain on login screen
      }
      return;
    }

    async function checkExistingSession() {
      try {
        const supabase = createClient();
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user && isMounted) {
          const { data } = await (supabase.from("admin_profiles") as any)
            .select("id, is_active")
            .eq("id", session.user.id)
            .maybeSingle();

          const profile = data as { id: string; is_active: boolean } | null;

          if (profile?.is_active && isMounted) {
            const destination = getSafeRedirectUrl(searchParams.get("next"));
            window.location.href = destination;
          }
        }
      } catch {
        // Environment unconfigured or unauthenticated; remain on login screen
      }
    }
    checkExistingSession();
    return () => {
      isMounted = false;
    };
  }, []);

  // Client-side form validation
  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      newErrors.email = "Email address is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      newErrors.email = "Please enter a valid email address (e.g. name@organisation.com).";
    }

    if (!password) {
      newErrors.password = "Password is required.";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    // 1. Initialize Supabase browser client
    let supabase;
    try {
      supabase = createClient();
    } catch {
      setErrors({
        general:
          "Authentication service is not configured. Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. Please verify your environment configuration.",
      });
      setIsSubmitting(false);
      return;
    }

    try {
      // 2. Perform Supabase password authentication
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        let userMsg = "Authentication failed. Please verify your credentials.";
        const msg = error.message.toLowerCase();
        if (msg.includes("invalid login credentials") || msg.includes("invalid grant")) {
          userMsg = "Invalid email address or password. Please verify your credentials and try again.";
        } else if (msg.includes("email not confirmed")) {
          userMsg = "Email address has not been confirmed. Please check your inbox.";
        } else if (msg.includes("rate limit") || msg.includes("too many requests")) {
          userMsg = "Too many sign-in attempts. Please wait a few moments before trying again.";
        } else if (error.message) {
          userMsg = error.message;
        }

        setErrors({ general: userMsg });
        setIsSubmitting(false);
        return;
      }

      if (!data.user) {
        setErrors({ general: "Sign in failed: No user identity returned from authentication service." });
        setIsSubmitting(false);
        return;
      }

      // 3. Verify user authorization in public.admin_profiles table
      const { data: profileData, error: profileError } = await (supabase.from("admin_profiles") as any)
        .select("id, email, full_name, role_id, is_active")
        .eq("id", data.user.id)
        .maybeSingle();

      const profile = profileData as {
        id: string;
        email: string;
        full_name: string;
        role_id: string;
        is_active: boolean;
      } | null;

      if (profileError) {
        await supabase.auth.signOut();
        setErrors({
          general: "Failed to verify administrative authorization profile. Please contact support.",
        });
        setIsSubmitting(false);
        return;
      }

      if (!profile) {
        await supabase.auth.signOut();
        setErrors({
          general: "Access Denied: Your account is not registered as an authorized administrator.",
        });
        setIsSubmitting(false);
        return;
      }

      if (!profile.is_active) {
        await supabase.auth.signOut();
        setErrors({
          general: "Access Denied: Your administrative account has been deactivated. Please contact the Business Owner.",
        });
        setIsSubmitting(false);
        return;
      }

      // 4. Update last login timestamp in admin_profiles (non-blocking)
      try {
        await (supabase.from("admin_profiles") as any)
          .update({ last_login_at: new Date().toISOString() })
          .eq("id", profile.id);
      } catch {
        // Non-fatal error; continue with login redirection
      }

      // 5. Open-redirect protected destination handling
      const searchParams = new URLSearchParams(window.location.search);
      const destination = getSafeRedirectUrl(searchParams.get("next"));

      // Full-page location change guarantees fresh SSR cookie evaluation by Edge middleware
      window.location.href = destination;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An unexpected network or service error occurred.";
      setErrors({ general: message });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf8f1] text-[#17271e] flex flex-col justify-between relative selection:bg-[#c7a45b]/30">
      {/* Brand Top Gradient Accent Line */}
      <div
        aria-hidden="true"
        className="h-1.5 w-full bg-gradient-to-r from-[#123c2c] via-[#c7a45b] to-[#1c573e] fixed top-0 left-0 z-50"
      />

      {/* Main Centered Authentication Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8 pt-8">
        <div className="w-full max-w-md mx-auto">
          {/* Brand Header */}
          <div className="text-center mb-6">
            <Link
              href="/"
              className="inline-block group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c7a45b] rounded-full"
              aria-label="Return to Bhavatarini Catering Homepage"
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border border-[#c7a45b]/40 bg-[#fffefa] p-2 shadow-md flex items-center justify-center mx-auto transition-transform duration-200 group-hover:scale-105">
                <Image
                  src="/images/bhavatarini-chef-logo.png"
                  alt="Bhavatarini Catering Logo"
                  width={64}
                  height={64}
                  priority
                  unoptimized
                  className="w-full h-full object-contain"
                />
              </div>
            </Link>

            <span className="text-[10.5px] font-bold uppercase tracking-[2.5px] text-[#997b3e] block mt-4 mb-1">
              Operations Hub • Administrative Portal
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#123c2c] tracking-tight">
              Sign In to Your Account
            </h1>
            <p className="text-xs text-[#69746a] mt-1.5 max-w-xs mx-auto">
              Authorised management access for catering operations, order reconciliation, and billing.
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-[#fffefa] border border-[#e5ddcd] rounded-[4px] shadow-card p-6 sm:p-8 relative">
            {/* General Authentication Error Banner */}
            {errors.general && (
              <div
                role="alert"
                aria-live="assertive"
                className="mb-5 p-3.5 rounded-[3px] bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2.5 animate-in fade-in duration-200"
              >
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span className="leading-relaxed font-medium">{errors.general}</span>
              </div>
            )}

            {/* Forgot Password Assistance Notice */}
            {showForgotNotice && (
              <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="forgot-password-title"
                className="mb-5 p-4 rounded-[3px] bg-[#f4f7f4] border border-[#718b62]/40 text-[#17271e] text-xs space-y-2 relative"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-[#123c2c]">
                    <HelpCircle className="w-4 h-4 text-[#718b62]" />
                    <span id="forgot-password-title">Administrative Password Assistance</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowForgotNotice(false)}
                    aria-label="Dismiss notice"
                    className="text-[#69746a] hover:text-[#17271e] p-0.5 rounded-sm"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-[#69746a] leading-relaxed">
                  For security reasons, password resets are restricted to authorised administrators. Please contact the primary Business Owner or catering director to request a credential reset.
                </p>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              {/* Email Address Field */}
              <div className="space-y-1.5">
                <label
                  htmlFor="admin-email"
                  className="block text-xs font-bold text-[#17271e] uppercase tracking-wider"
                >
                  Email Address <span className="text-red-600" aria-hidden="true">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#8e7139]">
                    <Mail className="w-4 h-4" aria-hidden="true" />
                  </div>
                  <input
                    id="admin-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    disabled={isSubmitting}
                    aria-required="true"
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? "email-error" : undefined}
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email || errors.general) {
                        setErrors((prev) => ({ ...prev, email: undefined, general: undefined }));
                      }
                    }}
                    placeholder="admin@bhavatarinicatering.com"
                    className={`w-full pl-9 pr-3 py-2.5 rounded-[2px] bg-[#faf8f1] border ${
                      errors.email
                        ? "border-red-500 focus:border-red-600 focus:ring-1 focus:ring-red-500"
                        : "border-[#dcd0b5] focus:border-[#c7a45b] focus:ring-1 focus:ring-[#c7a45b]"
                    } text-xs text-[#17271e] placeholder:text-[#9ea89e] outline-none transition-colors disabled:opacity-60 disabled:cursor-not-allowed`}
                  />
                </div>
                {errors.email && (
                  <p
                    id="email-error"
                    role="alert"
                    className="text-red-600 text-[11px] flex items-center gap-1 font-medium mt-1"
                  >
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{errors.email}</span>
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-1.5">
                <label
                  htmlFor="admin-password"
                  className="block text-xs font-bold text-[#17271e] uppercase tracking-wider"
                >
                  Password <span className="text-red-600" aria-hidden="true">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#8e7139]">
                    <Lock className="w-4 h-4" aria-hidden="true" />
                  </div>
                  <input
                    id="admin-password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    disabled={isSubmitting}
                    aria-required="true"
                    aria-invalid={!!errors.password}
                    aria-describedby={errors.password ? "password-error" : undefined}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password || errors.general) {
                        setErrors((prev) => ({ ...prev, password: undefined, general: undefined }));
                      }
                    }}
                    placeholder="Enter your account password"
                    className={`w-full pl-9 pr-10 py-2.5 rounded-[2px] bg-[#faf8f1] border ${
                      errors.password
                        ? "border-red-500 focus:border-red-600 focus:ring-1 focus:ring-red-500"
                        : "border-[#dcd0b5] focus:border-[#c7a45b] focus:ring-1 focus:ring-[#c7a45b]"
                    } text-xs text-[#17271e] placeholder:text-[#9ea89e] outline-none transition-colors disabled:opacity-60 disabled:cursor-not-allowed`}
                  />
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#8e7139] hover:text-[#123c2c] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c7a45b] rounded-sm disabled:opacity-50"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" aria-hidden="true" />
                    ) : (
                      <Eye className="w-4 h-4" aria-hidden="true" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p
                    id="password-error"
                    role="alert"
                    className="text-red-600 text-[11px] flex items-center gap-1 font-medium mt-1"
                  >
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{errors.password}</span>
                  </p>
                )}
              </div>

              {/* Remember Me & Forgot Password Row */}
              <div className="flex items-center justify-between pt-1 text-xs">
                <label className="flex items-center gap-2 cursor-pointer select-none text-[#69746a] hover:text-[#17271e]">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    disabled={isSubmitting}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded-[2px] border-[#dcd0b5] text-[#123c2c] focus:ring-1 focus:ring-[#c7a45b] accent-[#123c2c] cursor-pointer disabled:opacity-60"
                  />
                  <span>Remember me for 30 days</span>
                </label>

                <button
                  type="button"
                  onClick={() => setShowForgotNotice(!showForgotNotice)}
                  className="text-[#997b3e] hover:text-[#123c2c] hover:underline font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#c7a45b] rounded-xs"
                >
                  Forgot password?
                </button>
              </div>

              {/* Sign In Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 rounded-[2px] text-xs font-bold text-[#faf8f1] bg-gradient-to-r from-[#174a34] via-[#123c2c] to-[#0e3023] border border-[#c7a45b]/40 shadow-xs hover:brightness-110 active:brightness-95 transition-all flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c7a45b] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-[#c7a45b]" aria-hidden="true" />
                      <span>Signing In...</span>
                    </>
                  ) : (
                    <>
                      <Shield className="w-4 h-4 text-[#c7a45b]" aria-hidden="true" />
                      <span>Sign In to Operations</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Navigation & Security Footer */}
          <div className="mt-6 text-center space-y-3">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-[#69746a] hover:text-[#123c2c] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#c7a45b] rounded-xs"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#8e7139]" />
              <span>Return to Public Website</span>
            </Link>

            <div className="text-[11px] text-[#9ea89e] flex items-center justify-center gap-1.5">
              <span>Bhavatarini Catering Service</span>
              <span>•</span>
              <span>Coimbatore Operations Portal</span>
            </div>
          </div>
        </div>
      </main>

      {/* Subtle Bottom Accent Strip */}
      <footer className="py-4 text-center text-[10.5px] text-[#9ea89e] border-t border-[#e5ddcd]/50 bg-[#faf8f1]">
        <span>Strictly for authorised catering personnel. All session activity is monitored.</span>
      </footer>
    </div>
  );
}
