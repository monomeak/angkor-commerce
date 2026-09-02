export const mockInvoiceKeys = {
    all: ["invoices", "mock"] as const,
    list: () => [...mockInvoiceKeys.all, "list"] as const
};
