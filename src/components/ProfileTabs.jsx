import { NavLink, useParams } from "react-router-dom";

const tabs = [
  { label: "Posts", slug: "posts" },
  { label: "Comments", slug: "comments" },
  { label: "Reposts", slug: "reposts" },
  { label: "Media", slug: "media" },
];

export default function ProfileTabs() {
  const { username } = useParams();

  return (
    <nav
      aria-label="Profile sections"
      className="flex h-[53px] items-center justify-around border-b border-black/10 bg-white/60 shadow-sm dark:border-neutral-800 dark:bg-neutral-900/60"
    >
      {tabs.map(({ label, slug }) => (
        <NavLink
          key={slug}
          end={slug === "posts"}
          to={slug === "posts" ? `/profile/${username}` : `/profile/${username}/${slug}`}
          className={({ isActive }) =>
            `relative flex h-full flex-1 items-center justify-center text-sm font-medium transition-colors ${
              isActive
                ? "text-indigo-600 dark:text-indigo-300"
                : "text-neutral-500 hover:text-indigo-600 dark:text-neutral-400 dark:hover:text-indigo-300"
            }`
          }
        >
          {({ isActive }) => (
            <>
              {label}
              <span
                className={`absolute inset-x-1/4 bottom-0 h-1 rounded-full bg-indigo-500 transition-opacity dark:bg-indigo-400 ${
                  isActive ? "opacity-100" : "opacity-0"
                }`}
              />
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
