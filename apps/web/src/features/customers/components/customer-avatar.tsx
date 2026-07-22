import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface CustomerAvatarProps {
  avatarUrl: string;
  fullName: string;
  initials: string;
  className?: string;
}

export function CustomerAvatar({
  avatarUrl,
  fullName,
  initials,
  className,
}: CustomerAvatarProps) {
  return (
    <Avatar className={className}>
      <AvatarImage src={avatarUrl} alt={fullName} />
      <AvatarFallback>{initials}</AvatarFallback>
    </Avatar>
  );
}
