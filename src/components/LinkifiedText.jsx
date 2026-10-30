import { Link } from "react-router-dom";
import HighlightedText from "./HighlightedText";

const urlPattern = /(https?:\/\/[^\s]+|www\.[^\s]+|(?<![\p{L}\p{N}_&])#[\p{L}\p{N}_]+)/gu;
const trailingPunctuation = /[.,!?;:)}\]]+$/;

export default function LinkifiedText({ text, highlight }) {
  return text.split(urlPattern).map((part, index) => {
    if (part.startsWith("#")) {
      return (
        <Link
          key={`${part}-${index}`}
          to={`/search?q=${encodeURIComponent(part)}`}
          className="text-indigo-600 hover:underline dark:text-indigo-400"
          onClick={(event) => event.stopPropagation()}
        >
          <HighlightedText text={part} query={highlight}></HighlightedText>
        </Link>
      );
    }

    if (!/^(https?:\/\/|www\.)/.test(part))
      return <HighlightedText key={index} text={part} query={highlight} />;

    const punctuation = part.match(trailingPunctuation)?.[0] || "";
    const url = punctuation ? part.slice(0, -punctuation.length) : part;
    const href = url.startsWith("www.") ? `https://${url}` : url;

    return (
      <span key={`${part}-${index}`}>
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          className="break-all text-indigo-600 underline decoration-indigo-300 underline-offset-2 hover:text-indigo-500 dark:text-indigo-400"
          onClick={(event) => event.stopPropagation()}
        >
          {url}
        </a>
        {punctuation}
      </span>
    );
  });
}
