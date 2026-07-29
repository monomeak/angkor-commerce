import { useQuery } from "@tanstack/react-query";
import { teamKeys } from "../lib/query-keys";
import { fetchTeamRoster } from "../lib/team-storage";

export function useTeam() {
  return useQuery({
    queryKey: teamKeys.roster(),
    queryFn: fetchTeamRoster,
    staleTime: 60 * 1000,
  });
}
