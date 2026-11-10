/**
 * Neon outline icon system.
 *
 * Every icon is an inline SVG drawn with `stroke="currentColor"` so it inherits
 * text colour. The parent sets colour (default vintage gold) and optional glow via
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
  | "nav-arrow"
  | "menu"
  | "plus"
  | "minus"
  | "reset"
  | "external"
  | "probe"
  | "volume-on"
  | "volume-off";

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
  menu: `
    <path d="M4 7 L20 7 M4 12 L20 12 M4 17 L20 17" fill="none" stroke-linecap="round" />
  `,
  plus: `
    <path d="M12 5 L12 19 M5 12 L19 12" fill="none" stroke-linecap="round" />
  `,
  minus: `
    <path d="M5 12 L19 12" fill="none" stroke-linecap="round" />
  `,
  reset: `
    <path d="M20 12a8 8 0 1 1-2.34-5.66" fill="none" stroke-linecap="round" />
    <path d="M20 4 L20 8 L16 8" fill="none" stroke-linecap="round" stroke-linejoin="round" />
  `,
  external: `
    <path d="M14 4 L20 4 L20 10" fill="none" stroke-linecap="round" stroke-linejoin="round" />
    <path d="M20 4 L11 13" fill="none" stroke-linecap="round" />
    <path d="M18 14 L18 18 A2 2 0 0 1 16 20 L6 20 A2 2 0 0 1 4 18 L4 8 A2 2 0 0 1 6 6 L10 6" fill="none" stroke-linecap="round" stroke-linejoin="round" />
  `,
  probe: `
    <path d="M9 4 A8 8 0 0 0 9 16" fill="none" stroke-linecap="round" />
    <path d="M9 10 L14.5 10" fill="none" stroke-linecap="round" />
    <circle cx="16.5" cy="10" r="2.1" fill="none" />
    <path d="M18 12 L21.5 16" fill="none" stroke-linecap="round" />
    <path d="M15 12 L11.5 17" fill="none" stroke-linecap="round" />
  `,
  "volume-on": `
    <path d="M4 10 L8 10 L12 6 L12 18 L8 14 L4 14 Z" fill="none" stroke-linecap="round" stroke-linejoin="round" />
    <path d="M15 9 A3.5 3.5 0 0 1 15 15" fill="none" stroke-linecap="round" />
    <path d="M17.5 6.5 A7.5 7.5 0 0 1 17.5 17.5" fill="none" stroke-linecap="round" />
  `,
  "volume-off": `
    <path d="M4 10 L8 10 L12 6 L12 18 L8 14 L4 14 Z" fill="none" stroke-linecap="round" stroke-linejoin="round" />
    <path d="M16 9.5 L20.5 14.5 M20.5 9.5 L16 14.5" fill="none" stroke-linecap="round" />
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
