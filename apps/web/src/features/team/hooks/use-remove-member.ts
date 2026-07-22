import { useMutation, useQueryClient } from "@tanstack/react-query";
import { removeTeamMember } from "../lib/team-storage";
import { teamKeys } from "../lib/query-keys";
import type { TeamMember } from "../types/team";

export function useRemoveMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["team", "remove"],
    mutationFn: (id: string) => removeTeamMember(id),
    onSuccess: (_data, removeId) => {
      queryClient.setQueryData<TeamMember[]>(teamKeys.roster(), (old) =>
        old ? old.filter((m) => m.id !== removeId) : old,
      );
    },
  });
}
