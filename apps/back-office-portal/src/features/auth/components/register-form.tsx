"use client";

import Link from "next/link";
import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  UserRound,
} from "lucide-react";
import { useState } from "react";

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
import { useRegister } from "../hooks/use-register";

interface RegisterFormProps {
  onSuccess?: () => void;
}

export function RegisterForm({ onSuccess }: RegisterFormProps) {
  const { mutateAsync: register, isPending, error, isSuccess } = useRegister();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      await register({
        username,
        email,
        password,
        confirmPassword,
        firstName,
        lastName,
      });
      onSuccess?.();
    } catch {
      // error is already captured by the mutation's `error` state below
    }
  };

  return (
    <Card className="w-full shadow-xl shadow-foreground/5">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-semibold tracking-tight">
          Create your account
        </CardTitle>
        <CardDescription>
          Start organizing your invoices and payments with Angkor.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <FormField
            autoComplete="given-name"
            icon={UserRound}
            label="First name"
            name="firstName"
            placeholder="Alex"
            type="text"
            value={firstName}
            onChange={setFirstName}
          />
          <FormField
            autoComplete="family-name"
            icon={UserRound}
            label="Last name"
            name="lastName"
            placeholder="Morgan"
            type="text"
            value={lastName}
            onChange={setLastName}
          />
          <FormField
            autoComplete="username"
            icon={UserRound}
            label="Username"
            name="username"
            placeholder="alexmorgan"
            type="text"
            value={username}
            onChange={setUsername}
          />
          <FormField
            autoComplete="email"
            icon={Mail}
            label="Email address"
            name="email"
            placeholder="you@company.com"
            type="email"
            value={email}
            onChange={setEmail}
          />
          <FormField
            autoComplete="new-password"
            icon={LockKeyhole}
            label="Password"
            name="password"
            placeholder="Create a password"
            type="password"
            value={password}
            onChange={setPassword}
          />
          <FormField
            autoComplete="new-password"
            icon={LockKeyhole}
            label="Confirm password"
            name="confirmPassword"
            placeholder="Repeat your password"
            type="password"
            value={confirmPassword}
            onChange={setConfirmPassword}
          />

          <p className="text-xs leading-5 text-muted-foreground">
            By creating an account, you agree to our Terms of Service and
            Privacy Policy.
          </p>

          {error && (
            <p className="text-sm text-destructive">
              {error instanceof Error
                ? error.message
                : "Unable to create account"}
            </p>
          )}

          {isSuccess && (
            <p className="text-sm text-muted-foreground">
              Account created. Redirecting to sign in...
            </p>
          )}

          <Button
            className="relative h-10 w-full"
            type="submit"
            disabled={isPending}
          >
            <span>{isPending ? "Creating account..." : "Create account"}</span>
            <ArrowRight className="absolute right-3" />
          </Button>
        </form>
      </CardContent>

      <CardFooter className="justify-center text-center">
        <p className="text-xs text-muted-foreground">
          Already have an account?{" "}
          <Link
            className="font-medium text-foreground hover:underline"
            href="/login"
          >
            Sign in
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}

type FormFieldProps = {
  autoComplete: string;
  icon: typeof Mail;
  label: string;
  name: string;
  placeholder: string;
  type: "email" | "password" | "text";
  value: string;
  onChange: (value: string) => void;
};

function FormField({
  autoComplete,
  icon: Icon,
  label,
  name,
  placeholder,
  type,
  value,
  onChange,
}: FormFieldProps) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";

  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      <div className="relative">
        <Icon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          autoComplete={autoComplete}
          className={isPassword ? "pl-9 pr-10" : "pl-9"}
          id={name}
          name={name}
          placeholder={placeholder}
          required
          type={isPassword && showPassword ? "text" : type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
        {isPassword && (
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
            onClick={() => setShowPassword((visible) => !visible)}
            aria-label={showPassword ? `Hide ${label}` : `Show ${label}`}
            aria-pressed={showPassword}
          >
            {showPassword ? (
              <EyeOff className="size-4" />
            ) : (
              <Eye className="size-4" />
            )}
          </button>
        )}
      </div>
    </div>
  );
}
