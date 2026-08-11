export const authKeys = {
    all: ["auth"] as const,
    currentCustomer: () => [...authKeys.all, "me"] as const
};
