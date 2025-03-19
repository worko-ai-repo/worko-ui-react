export function toTitleCase(str: string | undefined | null): string {
  if (!str) return ""; // Return an empty string if str is null or undefined

  return str
    .toLowerCase()
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}