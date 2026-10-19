import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen px-6 py-20" style={{ backgroundColor: '#0a0a0a' }}>
      <div className="max-w-3xl mx-auto">
        <Link
          href="/"
          className="inline-block mb-8 text-sm hover:underline"
          style={{ color: '#CCFF00' }}
        >
          ← Back to Home
        </Link>

        <h1
          className="text-4xl md:text-5xl tracking-wider uppercase mb-4"
          style={{ fontFamily: 'var(--font-heading)', color: '#ffffff' }}
        >
          PRIVACY NOTICE
        </h1>
        <p className="text-sm mb-12" style={{ color: '#666666', fontFamily: 'var(--font-mono)' }}>
          Last updated: October 2026
        </p>

        <div className="space-y-10 text-sm leading-relaxed" style={{ color: '#cccccc' }}>
          <section>
            <h2
              className="text-xl tracking-wider uppercase mb-4"
              style={{ fontFamily: 'var(--font-heading)', color: '#CCFF00' }}
            >
              WHO WE ARE
            </h2>
            <p>
              The PUBG MOBILE Community Assembly — Ethiopia is an independently organized community
              event. It is <strong>not</strong> officially operated by or affiliated with PUBG MOBILE,
              Tencent, Krafton, Inc., or any related entities. The event is organized by community
              volunteers in Addis Ababa, Ethiopia.
            </p>
          </section>

          <section>
            <h2
              className="text-xl tracking-wider uppercase mb-4"
              style={{ fontFamily: 'var(--font-heading)', color: '#CCFF00' }}
            >
              WHAT DATA WE COLLECT
            </h2>
            <p className="mb-4">
              When you register for the event, we collect the following information:
            </p>
            <ul className="list-disc list-inside space-y-2" style={{ color: '#999999' }}>
              <li>Full legal name</li>
              <li>PUBG MOBILE in-game name and numeric UID</li>
              <li>Phone number with country code</li>
              <li>City or region of residence</li>
              <li>Participation category (attendee, player, team rep, creator, volunteer)</li>
              <li>Team name and squad details (if applicable)</li>
            </ul>
          </section>

          <section>
            <h2
              className="text-xl tracking-wider uppercase mb-4"
              style={{ fontFamily: 'var(--font-heading)', color: '#CCFF00' }}
            >
              WHY WE COLLECT IT
            </h2>
            <p>Your data is collected solely for the purpose of:</p>
            <ul className="list-disc list-inside space-y-2 mt-2" style={{ color: '#999999' }}>
              <li>Managing event registration and attendance</li>
              <li>Verifying participant identity at check-in</li>
              <li>Organizing tournament brackets and teams</li>
              <li>Communicating event updates to registered attendees</li>
              <li>Ensuring event safety and capacity management</li>
            </ul>
          </section>

          <section>
            <h2
              className="text-xl tracking-wider uppercase mb-4"
              style={{ fontFamily: 'var(--font-heading)', color: '#CCFF00' }}
            >
              DATA SHARING
            </h2>
            <p>
              We do <strong>not</strong> share, sell, or transfer your personal information to
              third parties. Your data is accessible only to authorized event organizers for the
              purposes described above.
            </p>
          </section>

          <section>
            <h2
              className="text-xl tracking-wider uppercase mb-4"
              style={{ fontFamily: 'var(--font-heading)', color: '#CCFF00' }}
            >
              DATA RETENTION
            </h2>
            <p>
              Your registration data will be retained for the duration of event planning and up to
              90 days after the event concludes, after which it will be permanently deleted. Check-in
              logs and audit records may be retained longer for accountability purposes, but will
              not contain sensitive personal information beyond what is necessary.
            </p>
          </section>

          <section>
            <h2
              className="text-xl tracking-wider uppercase mb-4"
              style={{ fontFamily: 'var(--font-heading)', color: '#CCFF00' }}
            >
              BIOMETRIC DATA
            </h2>
            <p>
              We do <strong>not</strong> collect biometric data, facial scans, or government-issued
              identification documents. Identity verification is performed through PUBG MOBILE UID,
              phone number, and QR code check-in at the venue.
            </p>
          </section>

          <section>
            <h2
              className="text-xl tracking-wider uppercase mb-4"
              style={{ fontFamily: 'var(--font-heading)', color: '#CCFF00' }}
            >
              YOUR RIGHTS
            </h2>
            <p className="mb-2">You have the right to:</p>
            <ul className="list-disc list-inside space-y-2" style={{ color: '#999999' }}>
              <li>Request a copy of the personal data we hold about you</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your registration and associated data</li>
              <li>Withdraw your registration at any time before the event</li>
            </ul>
            <p className="mt-4">
              To exercise any of these rights, contact the organizing team through our community
              channels or email.
            </p>
          </section>

          <section>
            <h2
              className="text-xl tracking-wider uppercase mb-4"
              style={{ fontFamily: 'var(--font-heading)', color: '#CCFF00' }}
            >
              DATA SECURITY
            </h2>
            <p>
              We implement reasonable security measures to protect your data, including server-side
              validation, secure authentication for admin access, rate limiting, and audit logging.
              However, no system is perfectly secure, and we cannot guarantee absolute data security.
            </p>
          </section>

          <section>
            <h2
              className="text-xl tracking-wider uppercase mb-4"
              style={{ fontFamily: 'var(--font-heading)', color: '#CCFF00' }}
            >
              CONTACT
            </h2>
            <p>
              For privacy-related inquiries, data requests, or concerns, please contact the
              organizing team through our Telegram community channel or email us at{' '}
              <span style={{ color: '#CCFF00' }}>contact@pubg-ethiopia.com</span>.
            </p>
          </section>
        </div>

        <div
          className="mt-16 pt-8 border-t text-xs"
          style={{ borderColor: 'rgba(255,255,255,0.06)', color: '#666666' }}
        >
          <p>
            This privacy notice applies to the PUBG MOBILE Community Assembly — Ethiopia
            registration website. This event is independently organized and is not affiliated
            with PUBG MOBILE, Tencent, or Krafton, Inc.
          </p>
        </div>
      </div>
    </div>
  );
}
