import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function titleCase(value: string) {
  return value
    .replace(/[-_]/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((chunk) => chunk[0]?.toUpperCase() + chunk.slice(1))
    .join(" ");
}

export function formatTemperature(valueC: number) {
  const fahrenheit = Math.round((valueC * 9) / 5 + 32);
  return `${Math.round(valueC)}C / ${fahrenheit}F`;
}

export function formatWearDate(value: string | null) {
  if (!value) {
    return "Never worn";
  }

  const diffMs = Date.now() - new Date(value).getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) {
    return "Worn today";
  }

  if (diffDays === 1) {
    return "Worn yesterday";
  }

  if (diffDays < 30) {
    return `${diffDays} days ago`;
  }

  const diffMonths = Math.floor(diffDays / 30);
  return `${diffMonths} month${diffMonths === 1 ? "" : "s"} ago`;
}

export function stableHash(input: string) {
  let hash = 0;

  for (let index = 0; index < input.length; index += 1) {
    hash = (hash * 31 + input.charCodeAt(index)) >>> 0;
  }

  return hash;
}

export function hashToVector(input: string, dimensions = 12) {
  const seed = stableHash(input);
  const vector = Array.from({ length: dimensions }, (_, index) => {
    const value = Math.sin(seed + index * 13.37) * 10000;
    return Number((value - Math.floor(value)).toFixed(6));
  });

  const magnitude = Math.sqrt(
    vector.reduce((accumulator, value) => accumulator + value * value, 0),
  );

  return vector.map((value) => Number((value / magnitude).toFixed(6)));
}

export function createSvgDataUri({
  title,
  subtitle,
  background,
  foreground = "#fdfaf4",
}: {
  title: string;
  subtitle: string;
  background: string;
  foreground?: string;
}) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="720" height="960" viewBox="0 0 720 960" fill="none">
      <defs>
        <linearGradient id="paint0" x1="60" y1="80" x2="640" y2="900" gradientUnits="userSpaceOnUse">
          <stop stop-color="${background}"/>
          <stop offset="1" stop-color="#0f1720"/>
        </linearGradient>
      </defs>
      <rect width="720" height="960" rx="54" fill="url(#paint0)"/>
      <rect x="62" y="62" width="596" height="836" rx="36" fill="rgba(253,250,244,0.08)" stroke="rgba(253,250,244,0.22)"/>
      <text x="92" y="150" fill="${foreground}" font-family="Space Grotesk, Arial" font-size="28" letter-spacing="4">LUMA</text>
      <text x="92" y="804" fill="${foreground}" font-family="Space Grotesk, Arial" font-size="64" font-weight="700">${title}</text>
      <text x="92" y="858" fill="rgba(253,250,244,0.76)" font-family="Space Grotesk, Arial" font-size="28">${subtitle}</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}
