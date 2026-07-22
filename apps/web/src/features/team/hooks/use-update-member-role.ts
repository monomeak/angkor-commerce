import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateTeamMemberRole } from "../lib/team-storage";
import { teamKeys } from "../lib/query-keys";

import type { TeamMember } from "../types/team";
import { AppRole } from "../../auth/types/auth";

export function useUpdateMemberRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["team", "update-role"],
    mutationFn: ({ id, role }: { id: string; role: AppRole }) =>
      updateTeamMemberRole(id, role),
    onSuccess: (updatedMember) => {
      queryClient.setQueryData<TeamMember[]>(teamKeys.roster(), (old) =>
        old
          ? old.map((m) => (m.id === updatedMember.id ? updatedMember : m))
          : old,
      );
    },
  });
}
