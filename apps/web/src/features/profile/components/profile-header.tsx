"use client";

import type { ComponentType } from "react";
import { Check, Mail, Pencil, Phone, X } from "lucide-react";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import type { UserProfile } from "../types/profile";

type ProfileHeaderProps = {
  profile: UserProfile;
  isEditing: boolean;
  onStartEditing: () => void;
  onSave: () => void;
  onCancel: () => void;
  onImageChange: (file: File | undefined) => void;
};

export function ProfileHeader({
  profile,
  isEditing,
  onStartEditing,
  onSave,
  onCancel,
  onImageChange,
}: ProfileHeaderProps) {
  const fullName = `${profile.firstName} ${profile.lastName}`;
  const profileInitials = `${profile.firstName[0] ?? ""}${
    profile.lastName[0] ?? ""
  }`;

  return (
    <section className="flex flex-col gap-4 rounded-lg border bg-card p-5 text-card-foreground md:flex-row md:items-center md:justify-between">
      <div className="flex min-w-0 items-center gap-4">
        <div className="relative shrink-0">
          <Label
            htmlFor="profile-image"
            className={
              isEditing
                ? "block cursor-pointer rounded-full focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"
                : "block"
            }
          >
            <Avatar className="size-16" size="lg">
              <AvatarImage src={profile.image} alt={fullName} />
              <AvatarFallback>{profileInitials || "U"}</AvatarFallback>
            </Avatar>

            {isEditing && (
              <span className="absolute right-0 bottom-0 flex size-6 items-center justify-center rounded-full border bg-background text-foreground shadow-sm">
                <Pencil className="size-3.5" />
              </span>
            )}
          </Label>
          <Input
            id="profile-image"
            type="file"
            accept="image/*"
            disabled={!isEditing}
            className="sr-only"
            onChange={(event) => onImageChange(event.target.files?.[0])}
          />
        </div>

        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="truncate text-xl font-semibold">{fullName}</h2>
            <span className="rounded-md bg-primary/10 px-2 py-1 text-xs font-medium uppercase text-primary">
              {profile.role}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            {profile.company.title} in {profile.company.department}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2 md:grid-cols-1">
          <ProfileLine icon={Mail} value={profile.email} />
          <ProfileLine icon={Phone} value={profile.phone} />
        </div>

        <div className="flex gap-2 md:justify-end">
          {isEditing ? (
            <>
              <Button type="button" variant="outline" onClick={onCancel}>
                <X className="size-4" />
                Cancel
              </Button>
              <Button type="button" onClick={onSave}>
                <Check className="size-4" />
                Save
              </Button>
            </>
          ) : (
            <Button type="button" variant="outline" onClick={onStartEditing}>
              <Pencil className="size-4" />
              Edit Profile
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}

function ProfileLine({
  icon: Icon,
  value,
}: {
  icon: ComponentType<{ className?: string }>;
  value: string;
}) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <Icon className="size-4 shrink-0" />
      <span className="truncate">{value}</span>
    </div>
  );
}
