export default function Cookies() {
  return (
    <article className="space-y-4">
      <h1 className="text-3xl font-bold">Cookie Policy</h1>
      <p className="text-sm text-neutral-500 dark:text-neutral-400">
        Last updated: October 2026
      </p>

      <h2 className="pt-4 text-xl font-semibold">Wait, what cookies?</h2>
      <p>
        Not the chocolate chip kind, sadly. Cookies are tiny bits of data your
        browser keeps so a website can remember you between visits.
      </p>

      <h2 className="pt-4 text-xl font-semibold">What Yappa actually uses</h2>
      <ul className="list-disc space-y-1 pl-6">
        <li>
          <strong>Sign-in cookie:</strong> keeps you logged in, so you
          don&apos;t have to type your password every time you want to yap.
        </li>
        <li>
          <strong>Local storage:</strong> remembers whether you picked light or
          dark mode. Yes, we remember your vibe.
        </li>
      </ul>
      <p>
        No ad cookies. No creepy tracking cookies. Nothing following you around
        the internet trying to sell you shoes.
      </p>

      <h2 className="pt-4 text-xl font-semibold">Getting rid of them</h2>
      <p>
        You can clear or block cookies in your browser settings. Just know that
        if you block the sign-in cookie, Yappa will forget you every five
        minutes, like a goldfish with a login page.
      </p>
    </article>
  );
}
