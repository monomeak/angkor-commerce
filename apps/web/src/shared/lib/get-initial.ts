export function getInitials(fullName: string): string {
  return fullName
    .split(" ")
    .map((part) => part.charAt(0))
    .join("")
    .toLocaleUpperCase()
    .slice(0, 2);
}
