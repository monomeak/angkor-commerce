"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SavedAddressPicker } from "@/src/features/addresses/components/saved-address-picker";
import { useAddresses, useDefaultAddress } from "@/src/features/addresses/hooks/use-addresses";
import type { CustomerAddress } from "@/src/features/addresses/types/address";
import { useCurrentCustomer } from "@/src/features/auth/hooks/use-current-customer";
import { useCart } from "@/src/features/cart/lib/cart-context";
import type { ShippingAddress } from "@/src/features/orders/types/order";
import { shippingAddressSchema } from "../schemas/shipping-address.schema";
import { getShippingDraft, saveShippingDraft } from "../lib/shipping-draft-storage";
import { toShippingAddress } from "../lib/saved-address";

export function ShippingForm() {
  const router = useRouter();
  const { items } = useCart();
  const savedAddresses = useAddresses();
  const defaultAddress = useDefaultAddress();
  const { data: customer } = useCurrentCustomer();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  const [isPrefilled, setIsPrefilled] = useState(false);

  function fillFrom(source: ShippingAddress) {
    setFullName(source.fullName);
    setPhone(source.phone);
    setAddress(source.address);
    setCity(source.city);
    setPostalCode(source.postalCode ?? "");
    setNotes(source.notes ?? "");
  }

  function fillFromSaved(saved: CustomerAddress) {
    // Picking a saved address is an explicit choice, so it overwrites the fields — unlike the
    // prefill below, which only ever runs on an untouched form.
    fillFrom(toShippingAddress(saved));
    setError(null);
  }

  useEffect(() => {
    // Auto-fill exactly once, but not before the sources exist: the draft is read after
    // hydration and the customer and their addresses arrive with their queries. Typing is
    // never clobbered, because the flag latches on the first fill.
    if (isPrefilled) {
      return;
    }

    const draft = getShippingDraft() ?? (defaultAddress && toShippingAddress(defaultAddress));

    /* eslint-disable react-hooks/set-state-in-effect */
    if (draft) {
      fillFrom(draft);
      setIsPrefilled(true);
      return;
    }

    if (customer) {
      setFullName(`${customer.firstName} ${customer.lastName}`);
      setPhone(customer.phone ?? "");
      setIsPrefilled(true);
    }
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [customer, defaultAddress, isPrefilled]);

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

      <SavedAddressPicker addresses={savedAddresses} onSelect={fillFromSaved} />

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
