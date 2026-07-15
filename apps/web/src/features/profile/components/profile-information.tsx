"use client";

import { Building2, MapPin, ShieldCheck, User } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import type { EditableProfileField, UserProfile } from "../types/profile";

type ProfileInformationProps = {
  profile: UserProfile;
  isEditing: boolean;
  onProfileChange: (field: EditableProfileField, value: string) => void;
  onCompanyChange: (field: keyof UserProfile["company"], value: string) => void;
  onAddressChange: (field: keyof UserProfile["address"], value: string) => void;
};

export function ProfileInformation({
  profile,
  isEditing,
  onProfileChange,
  onCompanyChange,
  onAddressChange,
}: ProfileInformationProps) {
  return (
    <>
      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="size-4" />
              Personal
            </CardTitle>
            <CardDescription>Basic account information.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <EditableField label="User ID" value={profile.id} disabled />
              <EditableField
                label="First name"
                value={profile.firstName}
                disabled={!isEditing}
                onChange={(value) => onProfileChange("firstName", value)}
              />
              <EditableField
                label="Last name"
                value={profile.lastName}
                disabled={!isEditing}
                onChange={(value) => onProfileChange("lastName", value)}
              />
              {/* <EditableField
                label="Username"
                value={profile.username}
                disabled={!isEditing}
                onChange={(value) => onProfileChange("username", value)}
              /> */}
              {/* <EditableField
                label="Email"
                value={profile.email}
                type="email"
                disabled={!isEditing}
                onChange={(value) => onProfileChange("email", value)}
              /> */}
              {/* <EditableField
                label="Phone"
                value={profile.phone}
                disabled={!isEditing}
                onChange={(value) => onProfileChange("phone", value)}
              /> */}
              <EditableField
                label="Gender"
                value={profile.gender}
                disabled={!isEditing}
                onChange={(value) => onProfileChange("gender", value)}
              />
              <EditableField
                label="Birth date"
                value={toDateInputValue(profile.birthDate)}
                type="date"
                disabled={!isEditing}
                onChange={(value) => onProfileChange("birthDate", value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="size-4" />
              Company
            </CardTitle>
            <CardDescription>Current organization details.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <EditableField
                label="Company"
                value={profile.company.name}
                disabled={!isEditing}
                onChange={(value) => onCompanyChange("name", value)}
              />
              <EditableField
                label="Department"
                value={profile.company.department}
                disabled={!isEditing}
                onChange={(value) => onCompanyChange("department", value)}
              />
              <EditableField
                label="Title"
                value={profile.company.title}
                disabled={!isEditing}
                onChange={(value) => onCompanyChange("title", value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="size-4" />
              Address
            </CardTitle>
            <CardDescription>Primary mailing address.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <EditableField
                label="Street"
                value={profile.address.address}
                disabled={!isEditing}
                onChange={(value) => onAddressChange("address", value)}
              />
              <EditableField
                label="City"
                value={profile.address.city}
                disabled={!isEditing}
                onChange={(value) => onAddressChange("city", value)}
              />
              <EditableField
                label="State"
                value={profile.address.state}
                disabled={!isEditing}
                onChange={(value) => onAddressChange("state", value)}
              />
              <EditableField
                label="Postal code"
                value={profile.address.postalCode}
                disabled={!isEditing}
                onChange={(value) => onAddressChange("postalCode", value)}
              />
              <EditableField
                label="Country"
                value={profile.address.country}
                disabled={!isEditing}
                onChange={(value) => onAddressChange("country", value)}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="size-4" />
            Account Access
          </CardTitle>
          <CardDescription>
            Profile permissions for this workspace.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3 rounded-lg border bg-muted/30 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-medium">Workspace administrator</p>
              <p className="text-sm text-muted-foreground">
                {profile.firstName} can manage invoices, team members, reports,
                and account settings.
              </p>
            </div>
            <span className="w-fit rounded-md border bg-background px-2.5 py-1 text-xs font-medium uppercase text-muted-foreground">
              {profile.role}
            </span>
          </div>
        </CardContent>
      </Card>
    </>
  );
}

function EditableField({
  label,
  value,
  type = "text",
  disabled = false,
  onChange,
}: {
  label: string;
  value: string | number;
  type?: string;
  disabled?: boolean;
  onChange?: (value: string) => void;
}) {
  const id = label.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type={type}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange?.(event.target.value)}
        className="disabled:cursor-default disabled:opacity-100"
      />
    </div>
  );
}

function toDateInputValue(value: string) {
  const [year, month, day] = value.split("-");

  if (!year || !month || !day) {
    return value;
  }

  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}
