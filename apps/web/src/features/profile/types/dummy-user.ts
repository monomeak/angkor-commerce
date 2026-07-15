// Raw DTO exactly as dummyjson.com returns it
export interface DummyUserResponse {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  username: string;
  image: string;
  gender: string;
  birthDate: string;
  role: string;
  company: {
    name: string;
    department: string;
    title: string;
  };
  address: {
    address: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
}

export const dummyUserResponse: DummyUserResponse = {
  id: 1,
  firstName: "Emily",
  lastName: "Johnson",
  email: "emily.johnson@x.dummyjson.com",
  phone: "+81 965-431-3024",
  username: "emilys",
  image: "https://dummyjson.com/icon/emilys/128",
  gender: "female",
  birthDate: "1996-5-30",
  role: "admin",
  company: {
    name: "Dooley, Kozey and Cronin",
    department: "Engineering",
    title: "Sales Manager",
  },
  address: {
    address: "626 Main Street",
    city: "Phoenix",
    state: "Mississippi",
    postalCode: "29112",
    country: "United States",
  },
};
