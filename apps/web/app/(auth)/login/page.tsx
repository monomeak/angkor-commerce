"use client";

import Link from "next/link";
import { ArrowRight, LockKeyhole, Mail } from "lucide-react";

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

export default function LoginPage() {
  // mutate ?
  return (
    <Card className="w-full shadow-xl shadow-foreground/5">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-semibold tracking-tight">
          Welcome back
        </CardTitle>
        <CardDescription>
          Enter your details to access your Acme dashboard.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email address</Label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                autoComplete="email items-center"
                className="h-11 py-0 pl-9 leading-normal"
                id="email"
                name="email"
                placeholder="you@mail.com"
                required
                type="email"
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
                className="pl-9"
                id="password"
                name="password"
                placeholder="Enter your password"
                required
                type="password"
              />
            </div>
          </div>

          <Button className="relative h-10 w-full" type="submit">
            <span>Sign in</span>
            <ArrowRight className="absolute right-3" />
          </Button>
        </form>
      </CardContent>

      <CardFooter className="justify-center text-center">
        <p className="text-xs text-muted-foreground">
          New to Acme?{" "}
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
