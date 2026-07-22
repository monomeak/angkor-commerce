import type { TeamMember } from "../types/team";

export const TEAM_SEED_DATA: TeamMember[] = [
  {
    id: "team_1",
    fullName: "Aiko Tanaka",
    email: "aiko@acme-invoices.com",
    role: "shop_admin",
    status: "active",
    joinedAt: "2025-11-03T00:00:00.000Z",
  },
  {
    id: "team_2",
    fullName: "Marcus Webb",
    email: "marcus@acme-invoices.com",
    role: "shop_admin",
    status: "active",
    joinedAt: "2026-01-14T00:00:00.000Z",
  },
  {
    id: "team_3",
    fullName: "Priya Nair",
    email: "priya@acme-invoices.com",
    role: "staff",
    status: "active",
    joinedAt: "2026-03-02T00:00:00.000Z",
  },
  {
    id: "team_4",
    fullName: "Devon Clarke",
    email: "devon@acme-invoices.com",
    role: "staff",
    status: "invited",
    joinedAt: "2026-07-10T00:00:00.000Z",
  },
];
