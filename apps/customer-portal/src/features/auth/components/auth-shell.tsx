type AuthShellProps = {
  readonly children: React.ReactNode;
};

export function AuthShell({ children }: AuthShellProps) {
  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center bg-secondary/40 px-4 py-16 sm:px-6">
      {children}
    </div>
  );
}
