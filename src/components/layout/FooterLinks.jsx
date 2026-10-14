import { Fragment } from "react";
import { Link } from "react-router-dom";

const links = [
  { to: "/en/terms", label: "Terms" },
  { to: "/en/privacy", label: "Privacy" },
  { to: "/en/cookies", label: "Cookies" },
  { to: "/en/accessibility", label: "Accessibility" },
  { to: "/en/about", label: "About" },
];

export default function FooterLinks() {
  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 px-4 text-xs text-neutral-500 dark:text-neutral-400">
      {links.map((l, i) => (
        <Fragment key={l.to}>
          {i > 0 && <span aria-hidden="true">·</span>}
          <Link to={l.to} className="hover:underline">
            {l.label}
          </Link>
        </Fragment>
      ))}
      <span aria-hidden="true">·</span>
      <span>© {new Date().getFullYear()} Yappa</span>
    </div>
  );
}
