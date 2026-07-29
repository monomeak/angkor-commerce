import type { AccountCustomer } from "../types/account";

// No auth/backend yet (see docs/NEXTJS_MIGRATION_PLAN.md) — mock the
// signed-in customer until a real session is wired up.
export const currentCustomer: AccountCustomer = {
  id: 1,
  firstName: "Sokmeak",
  lastName: "Sarenn",
  email: "sokmeak.sarenn@gmail.com",
};
