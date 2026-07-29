"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useCurrentUser } from "../../auth/hooks/use-current-user";
import { AddMemberDialog } from "../components/add-member-dialog";
import { useTeam } from "../hooks/use-team";
import { canManageTeam } from "../lib/permissions";
import { TeamTable } from "../components/team-table";

export function TeamView() {
  const { data: currentUser, isLoading: userLoading } = useCurrentUser();
  const { data: members, isLoading: teamLoading } = useTeam();

  if (userLoading) {
    return <p className="text-sm text-muted-foreground">Loading...</p>;
  }
  if (!currentUser || !canManageTeam(currentUser.role)) {
    return (
      <p className="text-sm text-muted-foreground">
        You don't have access to team management. Contact a Super Admin if you
        think this is a mistake.
      </p>
    );
  }
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        {/* <h1 className="text-lg font-seminbold">Team</h1> */}
        <AddMemberDialog actorRole={currentUser.role}></AddMemberDialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <TeamTable
            members={members ?? []}
            isLoading={teamLoading}
            actorRole={currentUser.role}
            actorUserId={currentUser.id}
          />
        </CardContent>
      </Card>
    </div>
  );
}
