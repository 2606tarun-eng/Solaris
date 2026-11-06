/**
 * Neon-blue outline icon system.
 *
 * Every icon is an inline SVG drawn with `stroke="currentColor"` so it inherits
 * text colour. The parent sets colour (default cyan-blue) and optional glow via
 * the `.icon` utility class. Strokes are deliberately thin and consistent so the
 * set reads as a single neon outline family, replacing the colourful emoji set.
 *
 * Usage:
 *   <Icon name="planet" size={18} className="icon--glow" />
 */

type IconName =
  | "planet"
  | "rocket"
  | "sparkle"
  | "clock"
  | "play"
  | "pause"
  | "bulb"
  | "search"
  | "arrow-left"
  | "arrow-right"
  | "close"
  | "gauge"
  | "nav-arrow";

const SHAPES: Record<IconName, string> = {
  planet: `
    <circle cx="12" cy="12" r="8" fill="none" stroke-linecap="round" />
    <path d="M4 12c0 2.2 1.8 4 4 4s4-1.8 4-4" fill="none" stroke-linecap="round" />
  `,
  rocket: `
    <path d="M12 4 L16 20 L14 20 L14 16 L10 16 L10 20 L8 20 Z" fill="none" stroke-linecap="round" stroke-linejoin="round" />
    <path d="M12 4 L12 10" fill="none" stroke-linecap="round" />
    <path d="M10 12 L14 12" fill="none" stroke-linecap="round" />
  `,
  sparkle: `
    <path d="M12 2 L12 22 M2 12 L22 12 M6 6 L18 18 M18 6 L6 18" fill="none" stroke-linecap="round" />
  `,
  clock: `
    <circle cx="12" cy="12" r="9" fill="none" stroke-linecap="round" />
    <path d="M12 12 L12 5 M12 12 L16 12" fill="none" stroke-linecap="round" />
  `,
  play: `
    <path d="M8 5 L20 12 L8 19 Z" fill="none" stroke-linecap="round" stroke-linejoin="round" />
  `,
  pause: `
    <path d="M10 5 L10 19 M14 5 L14 19" fill="none" stroke-linecap="round" />
  `,
  bulb: `
    <path d="M12 6 L12 14 L10 16 L10 20 L14 20 L14 16 L12 14 Z" fill="none" stroke-linecap="round" stroke-linejoin="round" />
    <path d="M12 6 L12 4" fill="none" stroke-linecap="round" />
    <path d="M9 18 L15 18" fill="none" stroke-linecap="round" />
  `,
  search: `
    <circle cx="11" cy="11" r="7" fill="none" stroke-linecap="round" />
    <path d="M16 16 L20 20" fill="none" stroke-linecap="round" />
  `,
  "arrow-left": `
    <path d="M16 12 L8 12 M12 8 L8 12 L12 16" fill="none" stroke-linecap="round" stroke-linejoin="round" />
  `,
  "arrow-right": `
    <path d="M8 12 L16 12 M12 8 L16 12 L12 16" fill="none" stroke-linecap="round" stroke-linejoin="round" />
  `,
  close: `
    <path d="M8 8 L16 16 M16 8 L8 16" fill="none" stroke-linecap="round" />
  `,
  gauge: `
    <path d="M5 19 A14 14 0 0 1 19 19" fill="none" stroke-linecap="round" />
    <path d="M12 19 L12 10 M12 10 L16 14" fill="none" stroke-linecap="round" />
  `,
  "nav-arrow": `
    <path d="M10 6 L14 10 L10 14" fill="none" stroke-linecap="round" stroke-linejoin="round" />
  `,
};

export default function Icon({
  name,
  size = 18,
  className = "",
  ...props
}: {
  name: IconName;
  size?: number;
  className?: string;
  [key: string]: unknown;
}) {
  return (
    <svg
      role="img"
      aria-label={name}
      className={`icon ${className}`.trim()}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      dangerouslySetInnerHTML={{ __html: SHAPES[name] }}
      {...props}
    />
  );
}
