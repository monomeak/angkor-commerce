"use client";

import { useState } from "react";

import { useCurrentUser } from "@/src/features/auth/hooks/use-current-user";

import { getProfileResponse } from "../api/profile-api";
import { mapProfileResponse } from "../mappers/profile.mapper";
import type { EditableProfileField, UserProfile } from "../types/profile";

const initialProfile = mapProfileResponse(getProfileResponse());

export function useProfile() {
  const { data: currentUser } = useCurrentUser();
  const authProfile = currentUser
    ? {
        ...initialProfile,
        id: currentUser.id,
        firstName: currentUser.firstName,
        lastName: currentUser.lastName,
        email: currentUser.email,
        username: currentUser.username,
        // core-api returns a MinIO object key or null; the rest of this feature still
        // runs on the DummyJSON mock (gender, birthDate, company, address), so those
        // fields keep coming from initialProfile until the profile port lands.
        image: currentUser.image ?? initialProfile.image,
        role: currentUser.role,
      }
    : initialProfile;

  const [savedProfile, setSavedProfile] = useState<UserProfile | null>(null);
  const [draftProfile, setDraftProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const activeSavedProfile =
    savedProfile?.id === authProfile.id ? savedProfile : authProfile;
  const formProfile = draftProfile ?? activeSavedProfile;

  const updateProfile = (field: EditableProfileField, value: string) => {
    setDraftProfile((currentProfile) => ({
      ...(currentProfile ?? formProfile),
      [field]: value,
    }));
  };

  const updateCompany = (
    field: keyof UserProfile["company"],
    value: string,
  ) => {
    setDraftProfile((currentProfile) => ({
      ...(currentProfile ?? formProfile),
      company: {
        ...(currentProfile ?? formProfile).company,
        [field]: value,
      },
    }));
  };

  const updateAddress = (
    field: keyof UserProfile["address"],
    value: string,
  ) => {
    setDraftProfile((currentProfile) => ({
      ...(currentProfile ?? formProfile),
      address: {
        ...(currentProfile ?? formProfile).address,
        [field]: value,
      },
    }));
  };

  const updateProfileImage = (file: File | undefined) => {
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.addEventListener("load", () => {
      if (typeof reader.result === "string") {
        setDraftProfile((currentProfile) => ({
          ...(currentProfile ?? formProfile),
          image: reader.result as string,
        }));
      }
    });
    reader.readAsDataURL(file);
  };

  const startEditing = () => {
    setDraftProfile(activeSavedProfile);
    setIsEditing(true);
  };

  const saveProfile = () => {
    setSavedProfile(formProfile);
    setDraftProfile(null);
    setIsEditing(false);
  };

  const cancelEditing = () => {
    setDraftProfile(null);
    setIsEditing(false);
  };

  return {
    formProfile,
    isEditing,
    updateProfile,
    updateCompany,
    updateAddress,
    updateProfileImage,
    startEditing,
    saveProfile,
    cancelEditing,
  };
}
