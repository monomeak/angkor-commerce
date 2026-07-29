import { TeamMember } from "../types/team";

import { TEAM_SEED_DATA } from "../data/team-seed-data";
import { AppRole } from "../../auth/types/auth";
const STORAGE_KEY = "team_roster";
function loadRoster(): TeamMember[] {
  if (typeof window === "undefined") return TEAM_SEED_DATA;
  const raw = window.localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(TEAM_SEED_DATA));
    return TEAM_SEED_DATA;
  }
  try {
    return JSON.parse(raw) as TeamMember[];
  } catch {
    return TEAM_SEED_DATA;
  }
}
function saveRoster(roster: TeamMember[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(roster));
}

// Simulated latency so loading states are visible/testable, same as
// other "no real backend yet" placeholders in this project.
async function delay(ms = 250): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

export async function fetchTeamRoster(): Promise<TeamMember[]> {
  await delay();
  return loadRoster();
}

export async function addTeamMember(member: TeamMember): Promise<TeamMember> {
  await delay();
  const roster = loadRoster();
  const next = [...roster, member];
  saveRoster(next);
  return member;
}

export async function updateTeamMemberRole(
  id: string,
  role: AppRole,
): Promise<TeamMember> {
  await delay();
  const roster = loadRoster();
  const updated = roster.map((m) => (m.id === id ? { ...m, role } : m));
  saveRoster(updated);
  const member = updated.find((m) => m.id === id);
  if (!member) throw new Error("Team member not found!");
  return member;
}

export async function removeTeamMember(id: string): Promise<void> {
  await delay();
  const roster = loadRoster();
  const remainMembers = roster.filter((m) => m.id !== id);
  saveRoster(remainMembers);
}
