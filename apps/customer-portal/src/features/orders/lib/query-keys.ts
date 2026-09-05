export const orderKeys = {
    all: ["orders"] as const,
    list: (page: number) => [...orderKeys.all, "list", page] as const,
    detail: (orderId: number) => [...orderKeys.all, "detail", orderId] as const
};
