import { useState } from "react";
import LinkifiedText from "./LinkifiedText";

const MAX_CHARS = 280;
const MAX_LINES = 6;

export default function ExpandableText({ text, className = "" }) {
  const [expanded, setExpanded] = useState(false);

  const lines = text.split("\n");
  const isLong = text.length > MAX_CHARS || lines.length > MAX_LINES;

  let preview = text;
  if (isLong) {
    preview = lines.slice(0, MAX_LINES).join("\n").slice(0, MAX_CHARS);
    // cut at a word boundary so a link or hashtag isn't sliced in half
    preview = preview.replace(/\s+\S*$/, "").trimEnd() + "…";
  }

  return (
    <div className="mb-3">
      <p className={className}>
        <LinkifiedText text={expanded || !isLong ? text : preview} />
      </p>
      {isLong && (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            setExpanded((value) => !value);
          }}
          className="mt-1 text-sm font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
        >
          {expanded ? "Show less" : "Show more"}
        </button>
      )}
    </div>
  );
}
