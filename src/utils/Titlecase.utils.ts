export function toTitleCase(str: string | undefined | null): string {
  if (!str) return ""; // Return an empty string if str is null or undefined
  return str
    // Add space around special characters so we can treat them as separate "words"
    .replace(/([&-])/g, ' $1 ')
    .split(/\s+/)
    .map(word =>
      ['&', '-'].includes(word)
        ? word // keep symbols as-is
        : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    )
    .join(' ')
    .replace(/\s+([&-])\s+/g, '$1'); // remove spaces around & and -
}

