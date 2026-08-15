import type { CustomerAddress } from "@/src/features/addresses/types/address";
import type { ShippingAddress } from "@/src/features/orders/types/order";

/**
 * Flattens a saved address into the shape checkout still works in.
 *
 * It is lossy on purpose — commune, district and province collapse into one street line and
 * a city — because orders are the last mock left here. Once `POST /storefront/orders` lands,
 * checkout should send the `addressId` instead and this adapter goes away.
 */
export function toShippingAddress(address: CustomerAddress): ShippingAddress {
    const street = [address.line1, address.line2, address.commune, address.district]
        .filter((part) => part && part.trim().length > 0)
        .join(", ");

    return {
        fullName: address.recipientName,
        phone: address.recipientPhone,
        address: street,
        city: address.province,
        postalCode: address.postalCode ?? undefined
    };
}
