import type { DummyUser } from "../types/dummy-customer";
import type { Customer } from "../types/customer";
import { getInitials } from "@/src/shared/lib/get-initial";

export function mapUserToCustomer(dto: DummyUser): Customer {
  return {
    id: dto.id,
    fullName: `${dto.firstName} ${dto.lastName}`,
    initials: getInitials(`${dto.firstName} ${dto.lastName}`),
    email: dto.email,
    phone: dto.phone,
    avatarUrl: dto.image,
    company: {
      name: dto.company.name,
      title: dto.company.title,
      department: dto.company.department,
    },
    location: {
      city: dto.address.city,
      state: dto.address.state,
      stateCode: dto.address.stateCode,
      country: dto.address.country,
    },
  };
}
