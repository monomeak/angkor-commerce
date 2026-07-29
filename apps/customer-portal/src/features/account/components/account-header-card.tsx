type AccountHeaderCardProps = {
  readonly firstName: string;
};

export function AccountHeaderCard({ firstName }: AccountHeaderCardProps) {
  return (
    <div className="min-h-[300px] rounded-t-3xl bg-card p-6">
      <p className="font-serif text-2xl text-muted-foreground">Hi,</p>
      <p className="font-serif text-5xl text-muted-foreground">{firstName}</p>
    </div>
  );
}
