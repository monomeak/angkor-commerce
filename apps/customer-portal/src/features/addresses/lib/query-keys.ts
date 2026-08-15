export const addressKeys = {
    all: ["addresses"] as const,
    list: () => [...addressKeys.all, "list"] as const
};
