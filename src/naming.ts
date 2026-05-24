export function slugify(value: string, fallback = "node"): string {
  const slug = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug.length > 0 ? slug : fallback;
}

export function toPascalCase(value: string, fallback = "FigmaComponent"): string {
  const normalized = value
    .trim()
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/[^A-Za-z0-9]+/g, "-");
  const words = slugify(normalized, fallback)
    .split("-")
    .filter(Boolean);
  const name = words.map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join("");

  if (/^[A-Z]/.test(name)) {
    return name;
  }

  return fallback;
}

export function classNameFor(name: string, id: string): string {
  return `frf-${slugify(name)}-${slugify(id)}`;
}

export function formatPx(value: number): string {
  return `${formatNumber(value)}px`;
}

export function formatNumber(value: number): string {
  return Number.isInteger(value) ? String(value) : String(Number(value.toFixed(4)));
}
