"use client";

import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AccountContent } from "../components/account-content";
import { changePasswordSchema } from "../schemas/change-password.schema";

export function ChangePasswordView() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const result = changePasswordSchema.safeParse({
      currentPassword,
      newPassword,
      confirmPassword,
    });

    if (!result.success) {
      setError(result.error.issues[0]?.message ?? "Please check your input.");
      setSuccess(false);
      return;
    }

    setError(null);
    setSuccess(true);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  }

  return (
    <AccountContent
      title="Change password"
      description="Update the password used to sign in to your account."
    >
      <form onSubmit={handleSubmit} className="flex max-w-sm flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="current-password">Current password</Label>
          <Input
            id="current-password"
            type="password"
            value={currentPassword}
            onChange={(event) => setCurrentPassword(event.target.value)}
            required
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="new-password">New password</Label>
          <Input
            id="new-password"
            type="password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            required
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="confirm-password">Confirm new password</Label>
          <Input
            id="confirm-password"
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            required
          />
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}
        {success && <p className="text-sm text-emerald-600">Password updated.</p>}

        <Button type="submit" className="w-fit">
          Update password
        </Button>
      </form>
    </AccountContent>
  );
}
