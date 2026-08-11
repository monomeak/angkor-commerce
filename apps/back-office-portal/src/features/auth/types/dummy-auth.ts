// Raw shapes exactly as dummyjson.com returns them.
// Never import these outside of api/ and mappers/ — the rest of the app
// should only ever see the domain types in `auth.ts`.

export interface DummyLoginResponse {
    id: number;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    // gender: string;
    image: string;
    accessToken: string;
    refreshToken: string;
}

export interface DummyRegisterResponse {
    id: number;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    image?: string;
}

export interface DummyCurrentUserResponse {
    id: number;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    gender: string;
    image: string;
    role: string;
}
