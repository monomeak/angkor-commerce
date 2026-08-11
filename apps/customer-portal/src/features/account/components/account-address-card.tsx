"use client";

import { useState } from "react";
import { MapPin } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { ShippingAddress } from "@/src/features/orders/types/order";
import { useSavedAddress } from "../lib/address-context";
import { AccountAddressForm } from "./account-address-form";

export function AccountAddressCard() {
  const { savedAddress, saveAddress } = useSavedAddress();
  const [isEditing, setIsEditing] = useState(false);

  function handleSaved(address: ShippingAddress) {
    saveAddress(address);
    setIsEditing(false);
  }

  if (isEditing) {
    return (
      <AccountAddressForm
        defaultValues={savedAddress ?? undefined}
        onSaved={handleSaved}
        onCancel={() => setIsEditing(false)}
      />
    );
  }

  if (!savedAddress) {
    return (
      <div className="flex flex-col items-center gap-3 py-10 text-center">
        <MapPin className="size-10 text-muted-foreground" />
        <p className="text-account-text">No shipping address saved yet.</p>
        <Button variant="outline" className="w-fit" onClick={() => setIsEditing(true)}>
          Add address
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-xl border bg-card p-4 text-sm">
        <p className="font-medium text-foreground">{savedAddress.fullName}</p>
        <p className="mt-1 text-muted-foreground">{savedAddress.phone}</p>
        <p className="mt-1 text-muted-foreground">
          {savedAddress.address}, {savedAddress.city}
          {savedAddress.postalCode ? ` ${savedAddress.postalCode}` : ""}
        </p>
        {savedAddress.notes && <p className="mt-1 text-muted-foreground">{savedAddress.notes}</p>}
      </div>
      <Button variant="outline" className="w-fit" onClick={() => setIsEditing(true)}>
        Edit address
      </Button>
    </div>
  );
}
