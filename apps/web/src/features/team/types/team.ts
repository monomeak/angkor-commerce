import { AppRole } from "../../auth/types/auth";

export type TeamMemberStatus = "active" | "invited" | "suspended";
export interface TeamMember {
  id: string;
  fullName: string;
  email: string;
  avatarUrl?: string;
  role: AppRole;
  status: TeamMemberStatus;
  joinedAt: string;
}

export interface InviteMemberPayload {
  email: string;
  fullName: string;
  role: AppRole;
}
