"use client";

import { useState } from "react";

import { getProfileResponse } from "../api/profile-api";
import { mapProfileResponse } from "../mappers/profile.mapper";
import type { EditableProfileField, UserProfile } from "../types/profile";

const initialProfile = mapProfileResponse(getProfileResponse());

export function useProfile() {
  const [savedProfile, setSavedProfile] = useState<UserProfile>(initialProfile);
  const [formProfile, setFormProfile] = useState<UserProfile>(initialProfile);
  const [isEditing, setIsEditing] = useState(false);

  const updateProfile = (field: EditableProfileField, value: string) => {
    setFormProfile((currentProfile) => ({
      ...currentProfile,
      [field]: value,
    }));
  };

  const updateCompany = (
    field: keyof UserProfile["company"],
    value: string,
  ) => {
    setFormProfile((currentProfile) => ({
      ...currentProfile,
      company: {
        ...currentProfile.company,
        [field]: value,
      },
    }));
  };

  const updateAddress = (
    field: keyof UserProfile["address"],
    value: string,
  ) => {
    setFormProfile((currentProfile) => ({
      ...currentProfile,
      address: {
        ...currentProfile.address,
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
        setFormProfile((currentProfile) => ({
          ...currentProfile,
          image: reader.result as string,
        }));
      }
    });
    reader.readAsDataURL(file);
  };

  const startEditing = () => setIsEditing(true);

  const saveProfile = () => {
    setSavedProfile(formProfile);
    setIsEditing(false);
  };

  const cancelEditing = () => {
    setFormProfile(savedProfile);
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
