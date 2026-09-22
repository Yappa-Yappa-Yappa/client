const urlPattern = /(https?:\/\/[^\s]+|www\.[^\s]+)/g;
const trailingPunctuation = /[.,!?;:)}\]]+$/;

export default function LinkifiedText({ text }) {
  return text.split(urlPattern).map((part, index) => {
    if (!/^(https?:\/\/|www\.)/.test(part)) return part;

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
