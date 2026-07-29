"use client";

import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { shippingAddressSchema } from "@/src/features/checkout/lib/checkout-schemas";
import type { ShippingAddress } from "@/src/features/orders/types/order";

type AccountAddressFormProps = {
  readonly defaultValues?: ShippingAddress;
  readonly onSaved: (address: ShippingAddress) => void;
  readonly onCancel: () => void;
};

export function AccountAddressForm({ defaultValues, onSaved, onCancel }: AccountAddressFormProps) {
  const [fullName, setFullName] = useState(defaultValues?.fullName ?? "");
  const [phone, setPhone] = useState(defaultValues?.phone ?? "");
  const [address, setAddress] = useState(defaultValues?.address ?? "");
  const [city, setCity] = useState(defaultValues?.city ?? "");
  const [postalCode, setPostalCode] = useState(defaultValues?.postalCode ?? "");
  const [notes, setNotes] = useState(defaultValues?.notes ?? "");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const result = shippingAddressSchema.safeParse({
      fullName,
      phone,
      address,
      city,
      postalCode,
      notes,
    });

    if (!result.success) {
      setError(result.error.issues[0]?.message ?? "Please check your input.");
      return;
    }

    setError(null);
    onSaved(result.data);
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-lg flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="address-full-name">Full name</Label>
          <Input
            id="address-full-name"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            required
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="address-phone">Phone</Label>
          <Input
            id="address-phone"
            type="tel"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            required
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="address-street">Address</Label>
        <Input
          id="address-street"
          value={address}
          onChange={(event) => setAddress(event.target.value)}
          required
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="address-city">City</Label>
          <Input
            id="address-city"
            value={city}
            onChange={(event) => setCity(event.target.value)}
            required
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="address-postal-code">Postal code (optional)</Label>
          <Input
            id="address-postal-code"
            value={postalCode}
            onChange={(event) => setPostalCode(event.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="address-notes">Delivery notes (optional)</Label>
        <Textarea
          id="address-notes"
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          placeholder="e.g. landmark, preferred delivery time"
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex gap-2">
        <Button type="submit">Save address</Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
