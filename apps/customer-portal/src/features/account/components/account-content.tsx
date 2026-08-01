type AccountContentProps = {
  readonly title: string;
  readonly description?: string;
  readonly children: React.ReactNode;
};

export function AccountContent({ title, description, children }: AccountContentProps) {
  return (
    <section className="rounded-3xl bg-card p-6 sm:p-8">
      <h1 className="text-2xl font-semibold text-foreground sm:text-3xl">{title}</h1>
      {description && <p className="mt-2 text-sm text-account-text">{description}</p>}
      <div className="mt-6">{children}</div>
    </section>
  );
}
