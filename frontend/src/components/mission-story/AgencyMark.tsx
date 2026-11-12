/**
 * Small agency mark shown beside the mission status.
 *
 * NASA gets a lightweight inline badge (no external logo file to ship or
 * licence). Any other agency gets an initials roundel, so Cassini's
 * "NASA / ESA / ASI" or JAXA missions still read correctly.
 */
export default function AgencyMark({ agency }: { agency: string }) {
  const isNasa = /nasa/i.test(agency);

  if (!isNasa) {
    const initials = agency
      .split(/[\s/+,·]+/)
      .filter(Boolean)
      .map((word) => word[0])
      .slice(0, 3)
      .join("")
      .toUpperCase();

    return (
      <span className="ms-agency" role="img" aria-label={agency} title={agency}>
        <span className="ms-agency-initials" aria-hidden="true">
          {initials}
        </span>
      </span>
    );
  }

  return (
    <span className="ms-agency" role="img" aria-label={agency} title={agency}>
      <svg viewBox="0 0 48 48" aria-hidden="true" focusable="false">
        <circle cx="24" cy="24" r="22" fill="#0b1e3f" stroke="rgba(250, 204, 21, 0.45)" />
        <path
          d="M8 32.5c9-9.5 24.5-11.5 33-6.5"
          fill="none"
          stroke="#e03c31"
          strokeWidth="2.6"
          strokeLinecap="round"
        />
        <text
          x="24"
          y="26"
          textAnchor="middle"
          fill="#f8fafc"
          fontFamily="'Space Grotesk:Bold', sans-serif"
          fontSize="10.5"
          letterSpacing="1.4"
        >
          NASA
        </text>
      </svg>
    </span>
  );
}
