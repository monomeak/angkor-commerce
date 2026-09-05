import { getInitials } from "@/src/shared/lib/get-initial";
import type { CustomerDto, CustomerListDto } from "../schemas/customer-api.schema";
import type { Customer, CustomerListResult } from "../types/customer";

/**
 * `displayName` is computed server-side and is never blank in practice, but a customer with
 * no company and no name would make it an empty string — the email is the one field the
 * table can always fall back to.
 */
export function mapCustomer(dto: CustomerDto): Customer {
    const displayName = dto.displayName?.trim() || dto.email;

    return {
        id: dto.id,
        displayName,
        firstName: dto.firstName,
        lastName: dto.lastName,
        initials: getInitials(displayName),
        companyName: dto.companyName,
        email: dto.email,
        phone: dto.phone,
        image: dto.image,
        taxNumber: dto.taxNumber,
        status: dto.status,
        createdAt: dto.createdAt,
        updatedAt: dto.updatedAt
    };
}

export function mapCustomerList(dto: CustomerListDto): CustomerListResult {
    return {
        customers: dto.customers.map(mapCustomer),
        total: dto.total,
        skip: dto.skip,
        limit: dto.limit
    };
}
