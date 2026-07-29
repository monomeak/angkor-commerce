"use client";

import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { accountProfileSchema } from "../lib/account-schemas";
import { useAccount } from "../lib/account-context";

export function AccountProfileForm() {
  const { customer, updateCustomer } = useAccount();
  const [isEditing, setIsEditing] = useState(false);
  const [firstName, setFirstName] = useState(customer.firstName);
  const [lastName, setLastName] = useState(customer.lastName);
  const [email, setEmail] = useState(customer.email);
  const [phone, setPhone] = useState(customer.phone ?? "");
  const [error, setError] = useState<string | null>(null);

  function startEditing() {
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
    updateCustomer(result.data);
    setIsEditing(false);
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
        <Button type="submit">Save changes</Button>
        <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
