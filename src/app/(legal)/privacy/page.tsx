export const metadata = { title: "Privacy Policy · Reppod" };

export default function PrivacyPage() {
  return (
    <>
      <h1>Privacy Policy</h1>
      <p className="text-sm text-white/40">Last updated: {new Date().getFullYear()}</p>

      <h2>1. What we collect</h2>
      <p>
        Account details (name, email), the coaching content you create (clients,
        workouts, meal plans, check-ins, messages), and basic usage data needed to
        run the Service. Payment details are handled by our payment provider — we
        never store card numbers.
      </p>

      <h2>2. How we use it</h2>
      <p>
        To provide the Service: authenticate you, show coaches their clients&apos;
        data, deliver notifications, process subscriptions, and improve reliability.
        We do not sell your personal data.
      </p>

      <h2>3. Who can see your data</h2>
      <p>
        Coaches only see their own clients. Clients only see their own data. Uploaded
        images are stored with our media provider (Cloudinary). Data is stored in
        MongoDB Atlas.
      </p>

      <h2>4. Cookies</h2>
      <p>
        We use a session cookie to keep you signed in. We don&apos;t use third-party
        advertising cookies.
      </p>

      <h2>5. Your rights</h2>
      <p>
        You can update your profile at any time, and request deletion of your account
        and associated data by contacting us. Deleting a client removes their linked
        records.
      </p>

      <h2>6. Contact</h2>
      <p>Privacy questions? Email privacy@reppod.app.</p>
    </>
  );
}
