import { formatLongDate, getGreeting } from "@/lib/utils";
import { getProfileResponse } from "@/src/features/profile/api/profile-api";

export default function Dashboard() {
  const userProfile = getProfileResponse();
  const fullName = `${userProfile.firstName} ${userProfile.lastName}`.trim();
  const date = new Date().toUTCString();

  return (
    <main>
      <span className=" text-muted-foreground">{formatLongDate(date)}</span>
      <h1 className="flex flex-col items-left gap-2 text-2xl font-semibold pt-2">
        <span>
          {getGreeting().toString()}, {userProfile.firstName}
        </span>
      </h1>
    </main>
  );
}
