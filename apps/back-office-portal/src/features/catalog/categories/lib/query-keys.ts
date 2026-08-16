export const categoryKeys = {
    all: ["catalog", "categories"] as const,
    list: () => [...categoryKeys.all, "list"] as const
};
