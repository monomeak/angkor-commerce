import { ReactNode } from "react";

type SettingsLayoutProps = {
  readonly children: ReactNode;
};

export default function SettingsLayout({ children }: SettingsLayoutProps) {
  return (
    <section className="space-y-6">
      {/* <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>

        <p className="text-sm text-muted-foreground">
          Manage your profile, appearance, and account security.
        </p>
      </div> */}
      <div className="pt-2">{children}</div>
    </section>
  );
}
