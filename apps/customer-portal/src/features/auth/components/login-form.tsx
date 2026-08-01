"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";

import { BrandLogo } from "@/components/brand/brand-logo";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { AuthField } from "./auth-field";
import { loginSchema } from "../lib/auth-schemas";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const result = loginSchema.safeParse({ email, password });

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
          <h1 className="text-3xl font-bold tracking-tight">Welcome Back!</h1>
          <p className="mt-2 text-sm text-muted-foreground sm:text-base">
            Log in now to explore all the features and benefits of our platform and see
            what&apos;s new.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <AuthField
            id="email"
            label="Enter your email"
            type="email"
            value={email}
            onChange={setEmail}
            required
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

          <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
            <Label htmlFor="remember" className="font-normal text-foreground">
              <Checkbox
                id="remember"
                checked={remember}
                onCheckedChange={setRemember}
              />
              Remember my account
            </Label>
            <Link
              href="#"
              className="font-medium text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
            >
              Forgot Password?
            </Link>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
          {success && <p className="text-sm text-emerald-600">Signed in.</p>}
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 border-t">
        <p className="px-8 py-6 text-sm text-muted-foreground sm:px-10 lg:px-12">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-semibold text-foreground hover:underline">
            Register Now
          </Link>
        </p>
        <Button type="submit" size="lg" className="h-full shrink-0 rounded-none px-10 text-base">
          Login
        </Button>
      </div>
    </form>
  );
}
