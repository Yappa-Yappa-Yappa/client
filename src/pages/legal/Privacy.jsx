export default function Privacy() {
  return (
    <article className="space-y-4">
      <h1 className="text-3xl font-bold">Privacy Policy</h1>
      <p className="text-sm text-neutral-500 dark:text-neutral-400">
        Last updated: October 2026
      </p>

      <h2 className="pt-4 text-xl font-semibold">1. What we collect</h2>
      <ul className="list-disc space-y-1 pl-6">
        <li>Account stuff: email, username, display name, and your password (scrambled, so even we can&apos;t read it).</li>
        <li>Profile stuff: avatar, background image and bio.</li>
        <li>Things you do: posts, comments, likes, reposts, follows and chat messages.</li>
        <li>If you use Google sign-in: your name, email and profile picture from Google.</li>
      </ul>

      <h2 className="pt-4 text-xl font-semibold">2. Why we have it</h2>
      <p>
        To make Yappa work: logging you in, showing your profile and posts,
        delivering messages and notifications, and keeping the app safe. We are
        not building a secret file on you. We barely have time to build the
        features.
      </p>

      <h2 className="pt-4 text-xl font-semibold">3. Who can see it</h2>
      <p>
        Your profile and posts are visible to other Yappa users, because
        that&apos;s what a social app is. Chat messages are only visible to the
        people in the conversation. We don&apos;t sell your personal
        information. Nobody would pay enough for your meme history anyway.
      </p>

      <h2 className="pt-4 text-xl font-semibold">4. Our helpers</h2>
      <p>
        Images you upload are stored with Cloudinary. If you choose Google
        sign-in, Google handles that login. They have their own privacy
        policies, which are probably longer and less fun than this one.
      </p>

      <h2 className="pt-4 text-xl font-semibold">5. Cookies</h2>
      <p>
        We use one to keep you signed in. Details are in the Cookie Policy.
        Still no chocolate chips.
      </p>

      <h2 className="pt-4 text-xl font-semibold">6. Your choices</h2>
      <p>
        You can edit your profile and delete your posts any time. If you want
        your whole account gone, contact us and we&apos;ll delete your data.
        We&apos;ll be sad, but we&apos;ll do it.
      </p>

      <h2 className="pt-4 text-xl font-semibold">7. Changes</h2>
      <p>
        We may update this policy. The date at the top shows when it last
        changed, so check it whenever you&apos;re bored.
      </p>
    </article>
  );
}
