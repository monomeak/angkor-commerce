"use client";

import Link from "next/link";
import { ArrowRight, Eye, EyeOff, LockKeyhole, UserRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLogin } from "../hooks/use-login";
import { useState } from "react";

interface LoginFormProps {
  onSuccess?: () => void;
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const { mutateAsync: login, isPending, error } = useLogin();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login({ username, password, rememberMe });
      onSuccess?.();
    } catch {
      setPassword("");
      // error is already captured by the mutation's `error` state below
    }
  };

  return (
    <Card className="w-full shadow-xl shadow-foreground/5">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-semibold tracking-tight">
          Welcome back
        </CardTitle>
        <CardDescription>
          Enter your details to access your Angkor dashboard.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <div className="relative">
              <UserRound className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                autoComplete="username"
                className="h-11 py-0 pl-9 leading-normal"
                id="username"
                name="username"
                placeholder="yourname"
                required
                type="text"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-4">
              <Label htmlFor="password">Password</Label>
              <Link
                className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                href="/forget-password"
              >
                Forgot password?
              </Link>
            </div>

            <div className="relative">
              <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                autoComplete="current-password"
                className="h-11 py-0 pl-9 pr-10"
                id="password"
                name="password"
                placeholder="Enter your password"
                required
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                onClick={() => setShowPassword((visible) => !visible)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
              >
                {showPassword ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Input
              id="rememberMe"
              name="rememberMe"
              type="checkbox"
              className="size-4"
              checked={rememberMe}
              onChange={(event) => setRememberMe(event.target.checked)}
            />
            <Label
              htmlFor="rememberMe"
              className="text-sm font-medium text-muted-foreground"
            >
              Remember me
            </Label>
          </div>

          {error && (
            <p className="text-sm text-destructive">
              {error instanceof Error ? error.message : "Unable to sign in"}
            </p>
          )}

          <Button
            className="relative h-10 w-full"
            type="submit"
            disabled={isPending}
          >
            <span>{isPending ? "Signing in..." : "Sign in"}</span>
            <ArrowRight className="absolute right-3" />
          </Button>
        </form>
      </CardContent>

      <CardFooter className="justify-center text-center">
        <p className="text-xs text-muted-foreground">
          New to Angkor?{" "}
          <Link
            className="font-medium text-foreground hover:underline"
            href="/register"
          >
            Create an account
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
