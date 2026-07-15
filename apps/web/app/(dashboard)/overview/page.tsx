import { getProfileResponse } from "@/src/features/profile/api/profile-api";

export default function Dashboard() {
  const userProfile = getProfileResponse();
  const fullName = `${userProfile.firstName} ${userProfile.lastName}`.trim();

  return (
    <h1 className="flex items-center gap-2 text-2xl font-semibold">
      <span>Hi, {fullName}</span>
      <span
        aria-hidden="true"
        className="inline-block origin-[70%_70%] animate-[wave_1.8s_ease-in-out_finite]"
      >
        👋
      </span>
    </h1>
  );
}
