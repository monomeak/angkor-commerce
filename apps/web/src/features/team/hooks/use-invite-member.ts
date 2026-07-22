import {
  QueryClient,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import { teamKeys } from "../lib/query-keys";
import type { InviteMemberPayload, TeamMember } from "../types/team";
import { addTeamMember } from "../lib/team-storage";

function toTeamMember(payload: InviteMemberPayload): TeamMember {
  return {
    id: `team_${Date.now()}`,
    fullName: payload.fullName,
    email: payload.email,
    role: payload.role,
    status: "invited",
    joinedAt: new Date().toISOString(),
  };
}

export function useInviteMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["team", "invite"],
    mutationFn: (payload: InviteMemberPayload) =>
      addTeamMember(toTeamMember(payload)),
    onSuccess: (newMember) => {
      queryClient.setQueryData<TeamMember[]>(teamKeys.roster(), (old) =>
        old ? [...old, newMember] : [newMember],
      );
    },
  });
}
