export interface CustomerLocation {
  city: string;
  state: string;
  stateCode: string;
  country: string;
}

export interface CustomerCompany {
  name: string;
  title: string;
  department: string;
}

export interface Customer {
  id: number;
  fullName: string;
  initials: string;
  email: string;
  phone: string;
  avatarUrl: string;
  company: CustomerCompany;
  location: CustomerLocation;
}

export interface CustomerListFilters {
  search: string;
  page: number;
  pageSize: number;
}

export interface CustomerListResult {
  customers: Customer[];
  total: number;
}
