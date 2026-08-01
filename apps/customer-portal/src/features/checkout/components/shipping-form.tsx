"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAccount } from "@/src/features/account/lib/account-context";
import { useCart } from "@/src/features/cart/lib/cart-context";
import { shippingAddressSchema } from "../lib/checkout-schemas";
import { getShippingDraft, saveShippingDraft } from "../lib/shipping-draft-storage";

export function ShippingForm() {
  const router = useRouter();
  const { items } = useCart();
  const { customer, savedAddress, saveAddress } = useAccount();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const draft = getShippingDraft() ?? savedAddress;
    if (draft) {
      setFullName(draft.fullName);
      setPhone(draft.phone);
      setAddress(draft.address);
      setCity(draft.city);
      setPostalCode(draft.postalCode ?? "");
      setNotes(draft.notes ?? "");
    } else {
      setFullName(`${customer.firstName} ${customer.lastName}`);
    }
    // Only auto-fill once on mount — typing shouldn't get clobbered by a
    // later account/context update.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    saveShippingDraft(result.data);
    saveAddress(result.data);
    router.push("/checkout");
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border bg-card p-10 text-center">
        <p className="text-muted-foreground">Your cart is empty.</p>
        <Button nativeButton={false} render={<Link href="/" />}>
          Continue shopping
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-2xl border bg-card p-6">
      <h1 className="text-xl font-semibold">Shipping address</h1>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="full-name">Full name</Label>
          <Input
            id="full-name"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            required
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            type="tel"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            required
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="address">Address</Label>
        <Input
          id="address"
          value={address}
          onChange={(event) => setAddress(event.target.value)}
          required
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="city">City</Label>
          <Input id="city" value={city} onChange={(event) => setCity(event.target.value)} required />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="postal-code">Postal code (optional)</Label>
          <Input
            id="postal-code"
            value={postalCode}
            onChange={(event) => setPostalCode(event.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="notes">Delivery notes (optional)</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          placeholder="e.g. landmark, preferred delivery time"
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" variant="accent" className="w-fit">
        Continue to checkout
      </Button>
    </form>
  );
}
