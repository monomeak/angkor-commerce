import { AccountAvatar } from "./account-avatar";

type AccountHeaderCardProps = {
    readonly firstName: string;
};

export function AccountHeaderCard({ firstName }: AccountHeaderCardProps) {
    return (
        <div className="min-h-[330px] rounded-3xl bg-card p-6">
            <AccountAvatar />
            <p className="mt-6 font-serif text-2xl text-muted-foreground">Hi,</p>
            <p className="font-serif text-5xl text-muted-foreground">{firstName}</p>
        </div>
    );
}
