"use client";

import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError } from "@/lib/api-client";
import { useCurrentCustomer } from "@/src/features/auth/hooks/use-current-customer";
import { useCreateAddress, useUpdateAddress } from "../hooks/use-address-mutations";
import { useReverseGeocode } from "../hooks/use-reverse-geocode";
import { toCoordinates } from "../lib/address-helpers";
import { addressFormSchema, type AddressFormFields } from "../schemas/address-form.schema";
import type { Coordinates, CustomerAddress } from "../types/address";
import { MapPicker } from "./map-picker";

type AddressFormProps = {
    /** Present when editing; absent when adding a new address. */
    readonly address?: CustomerAddress;
    /**
     * Whether to offer "make this my default". Pointless on the very first address (the API
     * makes it the default anyway) and on the one already holding it.
     */
    readonly canChooseDefault?: boolean;
    readonly onSaved: () => void;
    readonly onCancel: () => void;
};

const EMPTY_FIELDS: AddressFormFields = {
    label: "",
    recipientName: "",
    recipientPhone: "",
    line1: "",
    line2: "",
    commune: "",
    district: "",
    province: "",
    postalCode: ""
};

function toFields(address: CustomerAddress): AddressFormFields {
    return {
        label: address.label ?? "",
        recipientName: address.recipientName,
        recipientPhone: address.recipientPhone,
        line1: address.line1,
        line2: address.line2 ?? "",
        commune: address.commune ?? "",
        district: address.district,
        province: address.province,
        postalCode: address.postalCode ?? ""
    };
}

export function AddressForm({ address, canChooseDefault = false, onSaved, onCancel }: AddressFormProps) {
    const { data: customer } = useCurrentCustomer();
    const createAddress = useCreateAddress();
    const updateAddress = useUpdateAddress();
    const [fields, setFields] = useState<AddressFormFields>(() => {
        if (address) {
            return toFields(address);
        }

        // A new address almost always ships to the account holder, so start from their
        // details rather than an empty form. Both stay editable — gifts exist.
        return {
            ...EMPTY_FIELDS,
            recipientName: customer ? `${customer.firstName} ${customer.lastName}` : "",
            recipientPhone: customer?.phone ?? ""
        };
    });
    const [coordinates, setCoordinates] = useState<Coordinates | null>(() => (address ? toCoordinates(address) : null));
    const [makeDefault, setMakeDefault] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const lookUpPin = useReverseGeocode();

    const isSaving = createAddress.isPending || updateAddress.isPending;

    function setField(field: keyof AddressFormFields) {
        return (value: string) => setFields((current) => ({ ...current, [field]: value }));
    }

    function handlePinChange(pin: Coordinates) {
        setCoordinates(pin);
        lookUpPin.mutate(pin, {
            onSuccess: (geocoded) => {
                // Whatever the lookup couldn't name keeps what is already typed — OSM knows
                // the road for most of Phnom Penh but not always the commune.
                setFields((current) => ({
                    ...current,
                    line1: geocoded.line1 || current.line1,
                    commune: geocoded.commune || current.commune,
                    district: geocoded.district || current.district,
                    province: geocoded.province || current.province,
                    postalCode: geocoded.postalCode || current.postalCode
                }));
            }
        });
    }

    function handleSubmit(event: FormEvent) {
        event.preventDefault();

        const result = addressFormSchema.safeParse(fields);

        if (!result.success) {
            setError(result.error.issues[0]?.message ?? "Please check your input.");
            return;
        }

        setError(null);
        const onError = (cause: unknown) => {
            setError(cause instanceof ApiError ? cause.displayMessage : "Could not save your address.");
        };
        const payload = {
            ...result.data,
            latitude: coordinates?.latitude,
            longitude: coordinates?.longitude
        };

        if (address) {
            // Every field goes back on a PATCH, so clearing an optional one sticks.
            updateAddress.mutate({ addressId: address.id, payload }, { onSuccess: () => onSaved(), onError });
            return;
        }

        createAddress.mutate({ ...payload, isDefault: makeDefault }, { onSuccess: () => onSaved(), onError });
    }

    return (
        <form onSubmit={handleSubmit} className="flex max-w-lg flex-col gap-4 rounded-xl border bg-card p-4">
            <div className="grid gap-4 sm:grid-cols-2">
                <AddressField
                    id="address-label"
                    label="Label (optional)"
                    placeholder="Home, Office"
                    value={fields.label ?? ""}
                    onChange={setField("label")}
                />
                <AddressField
                    id="address-recipient-name"
                    label="Recipient name"
                    value={fields.recipientName}
                    onChange={setField("recipientName")}
                    required
                />
            </div>

            <div className="flex flex-col gap-1.5">
                <p className="text-sm font-medium text-foreground">Location on the map (optional)</p>
                <MapPicker value={coordinates} onChange={handlePinChange}>
                    {lookUpPin.isPending && <p className="text-xs text-muted-foreground">Looking up that spot…</p>}
                    {lookUpPin.isSuccess && (
                        <p className="text-xs text-muted-foreground">
                            Filled in from <span className="text-foreground">{lookUpPin.data.formatted}</span>. Correct
                            anything below.
                        </p>
                    )}
                    {lookUpPin.isError && (
                        <p className="text-xs text-muted-foreground">
                            Couldn&apos;t name that spot. The pin is kept — type the address below.
                        </p>
                    )}
                </MapPicker>
            </div>

            <AddressField
                id="address-recipient-phone"
                label="Phone"
                type="tel"
                placeholder="012 345 678"
                value={fields.recipientPhone}
                onChange={setField("recipientPhone")}
                required
            />

            <AddressField
                id="address-line1"
                label="House number and street"
                placeholder="No. 12, St. 271"
                value={fields.line1}
                onChange={setField("line1")}
                required
            />

            <AddressField
                id="address-line2"
                label="Building, floor or landmark (optional)"
                value={fields.line2 ?? ""}
                onChange={setField("line2")}
            />

            <div className="grid gap-4 sm:grid-cols-2">
                <AddressField
                    id="address-commune"
                    label="Commune / Sangkat (optional)"
                    value={fields.commune ?? ""}
                    onChange={setField("commune")}
                />
                <AddressField
                    id="address-district"
                    label="District / Khan"
                    value={fields.district}
                    onChange={setField("district")}
                    required
                />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <AddressField
                    id="address-province"
                    label="Province / City"
                    placeholder="Phnom Penh"
                    value={fields.province}
                    onChange={setField("province")}
                    required
                />
                <AddressField
                    id="address-postal-code"
                    label="Postal code (optional)"
                    value={fields.postalCode ?? ""}
                    onChange={setField("postalCode")}
                />
            </div>

            {canChooseDefault && (
                <Label className="flex w-fit items-center gap-2 text-sm font-normal">
                    <Checkbox checked={makeDefault} onCheckedChange={(checked) => setMakeDefault(checked)} />
                    Deliver here by default
                </Label>
            )}

            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="flex gap-2">
                <Button type="submit" disabled={isSaving}>
                    {isSaving ? "Saving…" : "Save address"}
                </Button>
                <Button type="button" variant="outline" disabled={isSaving} onClick={onCancel}>
                    Cancel
                </Button>
            </div>
        </form>
    );
}

type AddressFieldProps = {
    readonly id: string;
    readonly label: string;
    readonly value: string;
    readonly onChange: (value: string) => void;
    readonly type?: string;
    readonly placeholder?: string;
    readonly required?: boolean;
};

function AddressField({ id, label, value, onChange, type = "text", placeholder, required }: AddressFieldProps) {
    return (
        <div className="flex flex-col gap-1.5">
            <Label htmlFor={id}>{label}</Label>
            <Input
                id={id}
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={(event) => onChange(event.target.value)}
                required={required}
            />
        </div>
    );
}
