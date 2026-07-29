export interface DummyCoordinates {
  lat: number;
  lng: number;
}

export interface DummyAddress {
  address: string;
  city: string;
  state: string;
  stateCode: string;
  postalCode: string;
  coordinates: DummyCoordinates;
  country: string;
}

export interface DummyCompany {
  department: string;
  name: string;
  title: string;
  address: DummyAddress;
}

export interface DummyUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  image: string;
  company: DummyCompany;
  address: DummyAddress;
}

export interface DummyUsersResponse {
  users: DummyUser[];
  total: number;
  skip: number;
  limit: number;
}
