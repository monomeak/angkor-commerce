"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";

import { BrandLogo } from "@/components/brand/brand-logo";
import { Button } from "@/components/ui/button";
import { AuthField } from "./auth-field";
import { signupSchema } from "../lib/auth-schemas";

export function SignupForm() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const result = signupSchema.safeParse({
      firstName,
      lastName,
      email,
      phone,
      password,
      confirmPassword,
    });

    if (!result.success) {
      setError(result.error.issues[0]?.message ?? "Please check your input.");
      setSuccess(false);
      return;
    }

    setError(null);
    setSuccess(true);
  }

  return (
    <form onSubmit={handleSubmit} className="flex h-full flex-col">
      <div className="flex flex-1 flex-col gap-6 px-8 py-10 sm:px-10 lg:px-12 lg:py-12">
        <BrandLogo className="lg:hidden" />

        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create an account</h1>
          <p className="mt-2 text-sm text-muted-foreground sm:text-base">
            Sign up to track orders, save your details, and check out faster next time.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <AuthField
              id="first-name"
              label="First name"
              value={firstName}
              onChange={setFirstName}
              required
            />
            <AuthField
              id="last-name"
              label="Last name"
              value={lastName}
              onChange={setLastName}
              required
            />
          </div>

          <AuthField
            id="email"
            label="Enter your email"
            type="email"
            value={email}
            onChange={setEmail}
            required
          />

          <AuthField
            id="phone"
            label="Phone (optional)"
            type="tel"
            value={phone}
            onChange={setPhone}
          />

          <AuthField
            id="password"
            label="Enter your Password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={setPassword}
            required
            endAdornment={
              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                className="text-muted-foreground transition-colors hover:text-foreground"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            }
          />

          <AuthField
            id="confirm-password"
            label="Confirm password"
            type={showConfirmPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={setConfirmPassword}
            required
            endAdornment={
              <button
                type="button"
                onClick={() => setShowConfirmPassword((current) => !current)}
                className="text-muted-foreground transition-colors hover:text-foreground"
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            }
          />

          {error && <p className="text-sm text-destructive">{error}</p>}
          {success && <p className="text-sm text-emerald-600">Account created.</p>}
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 border-t">
        <p className="px-8 py-6 text-sm text-muted-foreground sm:px-10 lg:px-12">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-foreground hover:underline">
            Log in
          </Link>
        </p>
        <Button type="submit" size="lg" className="h-full shrink-0 rounded-none px-10 text-base">
          Create account
        </Button>
      </div>
    </form>
  );
}
