export const metadata = { title: "Terms of Service · Reppod" };

export default function TermsPage() {
  return (
    <>
      <h1>Terms of Service</h1>
      <p className="text-sm text-white/40">Last updated: {new Date().getFullYear()}</p>

      <h2>1. Agreement</h2>
      <p>
        By creating an account or using Reppod (&ldquo;the Service&rdquo;), you agree
        to these Terms. If you are using Reppod on behalf of a business, you agree
        on its behalf.
      </p>

      <h2>2. Accounts</h2>
      <p>
        You are responsible for keeping your login credentials secure and for all
        activity under your account. Coaches are responsible for the clients they
        invite and the content they create.
      </p>

      <h2>3. Subscriptions & billing</h2>
      <p>
        Paid plans are billed monthly or yearly through our payment provider. You
        can upgrade, downgrade, or cancel at any time from your billing dashboard;
        cancellations take effect at the end of the current billing period. Trials
        convert to paid plans unless cancelled beforehand.
      </p>

      <h2>4. Acceptable use</h2>
      <p>
        Don&apos;t use Reppod to break the law, infringe others&apos; rights, upload
        malicious content, or attempt to disrupt the Service. Fitness and nutrition
        content is provided by coaches, not by Reppod, and is not medical advice.
      </p>

      <h2>5. Content</h2>
      <p>
        You retain ownership of the content you upload. You grant Reppod the limited
        rights needed to store and display it to the people you share it with.
      </p>

      <h2>6. Termination</h2>
      <p>
        You may stop using the Service at any time. We may suspend or terminate
        accounts that violate these Terms.
      </p>

      <h2>7. Disclaimer & liability</h2>
      <p>
        The Service is provided &ldquo;as is&rdquo; without warranties. To the extent
        permitted by law, Reppod is not liable for indirect or consequential damages.
      </p>

      <h2>8. Contact</h2>
      <p>Questions? Email support@reppod.app.</p>
    </>
  );
}
