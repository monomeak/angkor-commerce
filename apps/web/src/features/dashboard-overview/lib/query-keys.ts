export const dashboardkeys = {
  all: ["dashboard"] as const,
  overview: () => [...dashboardkeys.all, "overview"] as const,
};
