export const teamKeys = {
  all: ["team"] as const,
  roster: () => [...teamKeys.all] as const,
};
