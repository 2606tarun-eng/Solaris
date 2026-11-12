import { useMemo } from "react";

/**
 * Wraps the phrases a chapter wants to emphasise in a gold `<mark>`.
 *
 * Keywords come from the mission data, so the copy stays plain text and the
 * emphasis is a presentation decision. Matches are case-insensitive and
 * longest-first, so "solar wind" wins over "solar".
 */

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export default function Highlight({ text, keywords }: { text: string; keywords: string[] }) {
  const parts = useMemo(() => {
    const list = keywords.map((word) => word.trim()).filter(Boolean);
    if (list.length === 0) return [{ value: text, key: false }];

    const sorted = [...list].sort((a, b) => b.length - a.length);
    const pattern = new RegExp(`(${sorted.map(escapeRegExp).join("|")})`, "gi");
    const lowered = new Set(list.map((word) => word.toLowerCase()));

    return text.split(pattern).map((value) => ({
      value,
      key: lowered.has(value.toLowerCase()),
    }));
  }, [text, keywords]);

  return (
    <>
      {parts.map((part, index) =>
        part.key ? (
          <mark className="ms-key" key={`${part.value}-${index}`}>
            {part.value}
          </mark>
        ) : (
          <span key={`${part.value}-${index}`}>{part.value}</span>
        ),
      )}
    </>
  );
}
