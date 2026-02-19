export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto p-6 lg:p-10">
      <div className="mb-6">
        <a
          href="/"
          className="text-sm text-slate-400 hover:text-white transition-colors"
        >
          Back to Reality Bracket
        </a>
      </div>

      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 lg:p-8 space-y-8">
        <header className="space-y-2">
          <h1 className="text-3xl lg:text-4xl font-semibold" style={{ color: '#BFFF0B' }}>
            Privacy Policy
          </h1>
          <p className="text-slate-400">
            This Privacy Policy explains how Reality Bracket collects, uses, and protects your
            information when you use the app.
          </p>
        </header>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold">Information We Collect</h2>
          <p className="text-slate-300">
            We collect information you provide directly, such as your name, email address, and
            league participation details. We also collect limited technical information like device
            type, browser, and usage data to improve performance and reliability.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold">How We Use Information</h2>
          <p className="text-slate-300">
            We use your information to operate the app, manage leagues and rosters, communicate
            with you about important updates, and improve features. We do not sell your personal
            information.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold">Sharing</h2>
          <p className="text-slate-300">
            We share information only as needed to run the service, such as with trusted providers
            that help us host or analyze the app. We may also disclose information to comply with
            legal obligations or protect the safety of users.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold">Data Retention</h2>
          <p className="text-slate-300">
            We retain your information for as long as your account is active or as needed to provide
            the service. You can request deletion of your account data through the app settings or
            by contacting support.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold">Security</h2>
          <p className="text-slate-300">
            We use reasonable administrative, technical, and physical safeguards to protect your
            information. No system is completely secure, so we cannot guarantee absolute security.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold">Your Choices</h2>
          <p className="text-slate-300">
            You can update profile details, manage league participation, and control some account
            settings within the app. If you need additional help, reach out through the support
            options provided in the app.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold">Children&apos;s Privacy</h2>
          <p className="text-slate-300">
            Reality Bracket is not intended for children under 13. We do not knowingly collect
            personal information from children under 13.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold">Changes to This Policy</h2>
          <p className="text-slate-300">
            We may update this Privacy Policy from time to time. If we make material changes, we
            will notify you through the app or other reasonable means.
          </p>
        </section>
      </div>
    </div>
  );
}

