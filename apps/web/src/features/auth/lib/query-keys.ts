/**
 * Centralized query keys — avoids typo'd/duplicated key arrays scattered
 * across hooks, and gives you one place to invalidate from.
 */

export const authKeys = {
  all: ["auth"] as const,
  currentUser: () => [...authKeys.all, "me"] as const,
};
