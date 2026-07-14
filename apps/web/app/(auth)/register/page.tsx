import Link from "next/link";
import { ArrowRight, LockKeyhole, Mail, UserRound } from "lucide-react";

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

export default function RegisterPage() {
  return (
    <Card className="w-full shadow-xl shadow-foreground/5">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-semibold tracking-tight">
          Create your account
        </CardTitle>
        <CardDescription>
          Start organizing your invoices and payments with Acme.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form className="space-y-4">
          <FormField
            autoComplete="name"
            icon={UserRound}
            label="Full name"
            name="name"
            placeholder="Alex Morgan"
            type="text"
          />
          <FormField
            autoComplete="email"
            icon={Mail}
            label="Email address"
            name="email"
            placeholder="you@company.com"
            type="email"
          />
          <FormField
            autoComplete="new-password"
            icon={LockKeyhole}
            label="Password"
            name="password"
            placeholder="Create a password"
            type="password"
          />
          <FormField
            autoComplete="new-password"
            icon={LockKeyhole}
            label="Confirm password"
            name="confirmPassword"
            placeholder="Repeat your password"
            type="password"
          />

          <p className="text-xs leading-5 text-muted-foreground">
            By creating an account, you agree to our Terms of Service and
            Privacy Policy.
          </p>

          <Button className="relative h-10 w-full" type="submit">
            <span>Create account</span>
            <ArrowRight className="absolute right-3" />
          </Button>
        </form>
      </CardContent>

      <CardFooter className="justify-center text-center">
        <p className="text-xs text-muted-foreground">
          Already have an account?{" "}
          <Link className="font-medium text-foreground hover:underline" href="/login">
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
};

function FormField({
  autoComplete,
  icon: Icon,
  label,
  name,
  placeholder,
  type,
}: FormFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      <div className="relative">
        <Icon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          autoComplete={autoComplete}
          className="pl-9"
          id={name}
          name={name}
          placeholder={placeholder}
          required
          type={type}
        />
      </div>
    </div>
  );
}
