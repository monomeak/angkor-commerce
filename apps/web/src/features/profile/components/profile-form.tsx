"use client";

import { useProfile } from "../hooks/use-profile";
import { ProfileHeader } from "./profile-header";
import { ProfileInformation } from "./profile-information";

export function ProfileForm() {
  const {
    formProfile,
    isEditing,
    updateProfile,
    updateCompany,
    updateAddress,
    updateProfileImage,
    startEditing,
    saveProfile,
    cancelEditing,
  } = useProfile();

  return (
    <div className="w-full space-y-6">
      <ProfileHeader
        profile={formProfile}
        isEditing={isEditing}
        onStartEditing={startEditing}
        onSave={saveProfile}
        onCancel={cancelEditing}
        onImageChange={updateProfileImage}
      />
      <ProfileInformation
        profile={formProfile}
        isEditing={isEditing}
        onProfileChange={updateProfile}
        onCompanyChange={updateCompany}
        onAddressChange={updateAddress}
      />
    </div>
  );
}
