export default function HighlightedText({ text, query }) {
  const term = query?.trim();
  if (!term) return text;

  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return text.split(new RegExp(`(${escaped})`, "gi")).map((part, index) =>
    index % 2 === 1 ? (
      <mark key={index} className="rounded-sm bg-indigo-500/20 text-inherit">
        {part}
      </mark>
    ) : (
      part
    ),
  );
}
