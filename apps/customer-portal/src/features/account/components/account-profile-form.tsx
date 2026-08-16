"use client";

import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiError } from "@/lib/api-client";
import { useCurrentCustomer } from "@/src/features/auth/hooks/use-current-customer";
import { useUpdateProfile } from "@/src/features/auth/hooks/use-update-profile";
import { accountProfileSchema } from "../schemas/profile.schema";

export function AccountProfileForm() {
  const { data: customer, isPending } = useCurrentCustomer();
  const updateProfile = useUpdateProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (isPending) {
    return <Skeleton className="h-40 w-full" />;
  }

  if (!customer) {
    return <p className="text-sm text-muted-foreground">Sign in to see your details.</p>;
  }

  function startEditing() {
    if (!customer) {
      return;
    }

    setFirstName(customer.firstName);
    setLastName(customer.lastName);
    setEmail(customer.email);
    setPhone(customer.phone ?? "");
    setError(null);
    setIsEditing(true);
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const result = accountProfileSchema.safeParse({ firstName, lastName, email, phone });

    if (!result.success) {
      setError(result.error.issues[0]?.message ?? "Please check your input.");
      return;
    }

    setError(null);
    updateProfile.mutate(result.data, {
      onSuccess: () => setIsEditing(false),
      onError: (cause) => {
        setError(
          cause instanceof ApiError ? cause.displayMessage : "Could not save your details.",
        );
      },
    });
  }

  if (!isEditing) {
    return (
      <div className="flex flex-col gap-6">
        <dl className="grid gap-6 sm:grid-cols-2">
          <div>
            <dt className="text-sm text-muted-foreground">Full name</dt>
            <dd className="mt-1 text-base font-medium text-foreground">
              {customer.firstName} {customer.lastName}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">Email</dt>
            <dd className="mt-1 text-base font-medium text-foreground">{customer.email}</dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">Phone</dt>
            <dd className="mt-1 text-base font-medium text-foreground">
              {customer.phone || "Not set"}
            </dd>
          </div>
        </dl>
        <Button variant="outline" className="w-fit" onClick={startEditing}>
          Edit details
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-lg flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="profile-first-name">First name</Label>
          <Input
            id="profile-first-name"
            value={firstName}
            onChange={(event) => setFirstName(event.target.value)}
            required
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="profile-last-name">Last name</Label>
          <Input
            id="profile-last-name"
            value={lastName}
            onChange={(event) => setLastName(event.target.value)}
            required
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="profile-email">Email</Label>
        <Input
          id="profile-email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="profile-phone">Phone (optional)</Label>
        <Input
          id="profile-phone"
          type="tel"
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex gap-2">
        <Button type="submit" disabled={updateProfile.isPending}>
          {updateProfile.isPending ? "Saving…" : "Save changes"}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={updateProfile.isPending}
          onClick={() => setIsEditing(false)}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
