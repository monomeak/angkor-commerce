"use client";

import type { ComponentType } from "react";
import { useState } from "react";
import {
  Building2,
  Check,
  Mail,
  MapPin,
  Pencil,
  Phone,
  ShieldCheck,
  User,
  X,
} from "lucide-react";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type UserProfile = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  username: string;
  image: string;
  gender: string;
  birthDate: string;
  role: string;
  company: {
    name: string;
    department: string;
    title: string;
  };
  address: {
    address: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
};

type EditableProfileField = Exclude<
  keyof UserProfile,
  "id" | "image" | "role" | "company" | "address"
>;

const profile: UserProfile = {
  id: 1,
  firstName: "Emily",
  lastName: "Johnson",
  email: "emily.johnson@x.dummyjson.com",
  phone: "+81 965-431-3024",
  username: "emilys",
  image: "https://dummyjson.com/icon/emilys/128",
  gender: "female",
  birthDate: "1996-5-30",
  role: "admin",
  company: {
    name: "Dooley, Kozey and Cronin",
    department: "Engineering",
    title: "Sales Manager",
  },
  address: {
    address: "626 Main Street",
    city: "Phoenix",
    state: "Mississippi",
    postalCode: "29112",
    country: "United States",
  },
};

export default function MyProfile() {
  const [savedProfile, setSavedProfile] = useState(profile);
  const [formProfile, setFormProfile] = useState(profile);
  const [isEditing, setIsEditing] = useState(false);

  const fullName = `${formProfile.firstName} ${formProfile.lastName}`;
  const profileInitials = `${formProfile.firstName[0] ?? ""}${
    formProfile.lastName[0] ?? ""
  }`;

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

  const handleSave = () => {
    setSavedProfile(formProfile);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormProfile(savedProfile);
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
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
                <AvatarImage src={formProfile.image} alt={fullName} />
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
              onChange={(event) => updateProfileImage(event.target.files?.[0])}
            />
          </div>

          <div className="min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="truncate text-xl font-semibold">{fullName}</h2>
              <span className="rounded-md bg-primary/10 px-2 py-1 text-xs font-medium uppercase text-primary">
                {formProfile.role}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              {formProfile.company.title} in {formProfile.company.department}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2 md:grid-cols-1">
            <ProfileLine icon={Mail} value={formProfile.email} />
            <ProfileLine icon={Phone} value={formProfile.phone} />
          </div>

          <div className="flex gap-2 md:justify-end">
            {isEditing ? (
              <>
                <Button type="button" variant="outline" onClick={handleCancel}>
                  <X className="size-4" />
                  Cancel
                </Button>
                <Button type="button" onClick={handleSave}>
                  <Check className="size-4" />
                  Save
                </Button>
              </>
            ) : (
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditing(true)}
              >
                <Pencil className="size-4" />
                Edit Profile
              </Button>
            )}
          </div>
        </div>
      </section>

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
              <EditableField label="User ID" value={formProfile.id} disabled />
              <EditableField
                label="First name"
                value={formProfile.firstName}
                disabled={!isEditing}
                onChange={(value) => updateProfile("firstName", value)}
              />
              <EditableField
                label="Last name"
                value={formProfile.lastName}
                disabled={!isEditing}
                onChange={(value) => updateProfile("lastName", value)}
              />
              <EditableField
                label="Username"
                value={formProfile.username}
                disabled={!isEditing}
                onChange={(value) => updateProfile("username", value)}
              />
              <EditableField
                label="Email"
                value={formProfile.email}
                type="email"
                disabled={!isEditing}
                onChange={(value) => updateProfile("email", value)}
              />
              <EditableField
                label="Phone"
                value={formProfile.phone}
                disabled={!isEditing}
                onChange={(value) => updateProfile("phone", value)}
              />
              <EditableField
                label="Gender"
                value={formProfile.gender}
                disabled={!isEditing}
                onChange={(value) => updateProfile("gender", value)}
              />
              <EditableField
                label="Birth date"
                value={toDateInputValue(formProfile.birthDate)}
                type="date"
                disabled={!isEditing}
                onChange={(value) => updateProfile("birthDate", value)}
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
                value={formProfile.company.name}
                disabled={!isEditing}
                onChange={(value) => updateCompany("name", value)}
              />
              <EditableField
                label="Department"
                value={formProfile.company.department}
                disabled={!isEditing}
                onChange={(value) => updateCompany("department", value)}
              />
              <EditableField
                label="Title"
                value={formProfile.company.title}
                disabled={!isEditing}
                onChange={(value) => updateCompany("title", value)}
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
                value={formProfile.address.address}
                disabled={!isEditing}
                onChange={(value) => updateAddress("address", value)}
              />
              <EditableField
                label="City"
                value={formProfile.address.city}
                disabled={!isEditing}
                onChange={(value) => updateAddress("city", value)}
              />
              <EditableField
                label="State"
                value={formProfile.address.state}
                disabled={!isEditing}
                onChange={(value) => updateAddress("state", value)}
              />
              <EditableField
                label="Postal code"
                value={formProfile.address.postalCode}
                disabled={!isEditing}
                onChange={(value) => updateAddress("postalCode", value)}
              />
              <EditableField
                label="Country"
                value={formProfile.address.country}
                disabled={!isEditing}
                onChange={(value) => updateAddress("country", value)}
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
          <CardDescription>Profile permissions for this workspace.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3 rounded-lg border bg-muted/30 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-medium">Workspace administrator</p>
              <p className="text-sm text-muted-foreground">
                {formProfile.firstName} can manage invoices, team members,
                reports, and account settings.
              </p>
            </div>
            <span className="w-fit rounded-md border bg-background px-2.5 py-1 text-xs font-medium uppercase text-muted-foreground">
              {formProfile.role}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
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
