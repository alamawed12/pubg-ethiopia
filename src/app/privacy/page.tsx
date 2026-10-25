import Link from 'next/link';
import { AlertTriangleIcon } from '@/components/ui/TacticalIcons';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen px-4 sm:px-6 md:px-8 py-16 sm:py-24" style={{ backgroundColor: '#0a0a0a' }}>
      <div className="max-w-4xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-2 mb-8 text-xs font-mono tracking-wider uppercase hover:underline"
          style={{ color: '#CCFF00' }}
        >
          <span>←</span> Back to Home
        </Link>

        {/* Header */}
        <div className="mb-10 pb-6 border-b border-white/10">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2.5 h-2.5 bg-[#CCFF00] rotate-45 shadow-[0_0_8px_#CCFF00]" />
            <span className="font-mono text-xs tracking-widest uppercase text-[#CCFF00]">
              PUBG MOBILE COMMUNITY ASSEMBLY • ETHIOPIA
            </span>
          </div>
          <h1
            className="text-3xl sm:text-4xl md:text-5xl font-black tracking-wider uppercase mb-3 text-white"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            REGISTRATION &amp; PRIVACY POLICY
          </h1>
          <p className="text-xs font-mono text-[#666666]">
            Effective Date: October 2026 • Official Registration Policy
          </p>
        </div>

        {/* Policy Body */}
        <div className="space-y-10 text-sm leading-relaxed text-[#cccccc]">
          {/* Section 1 */}
          <section className="p-6 rounded-xl bg-[#111111] border border-white/5 space-y-3">
            <h2
              className="text-lg sm:text-xl font-bold tracking-wider uppercase text-[#CCFF00] flex items-center gap-2"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              <span>1.</span> PURPOSE OF REGISTRATION
            </h2>
            <p>
              The PUBG MOBILE COMMUNITY ASSEMBLY website allows interested participants to register for community gatherings, networking meetups, workshops, and related events.
            </p>
            <p>
              By submitting the registration form, you confirm that the information you provide is accurate and that you have read and accepted this policy.
            </p>
          </section>

          {/* Section 2 */}
          <section className="p-6 rounded-xl bg-[#111111] border border-white/5 space-y-3">
            <h2
              className="text-lg sm:text-xl font-bold tracking-wider uppercase text-[#CCFF00] flex items-center gap-2"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              <span>2.</span> INFORMATION WE COLLECT
            </h2>
            <p>Depending on the information requested on the registration form, we may collect:</p>
            <ul className="list-disc list-inside space-y-1.5 text-[#aaaaaa] pl-2">
              <li>Full name or preferred participant name.</li>
              <li>PUBG MOBILE in-game name (IGN).</li>
              <li>PUBG MOBILE Player ID (UID).</li>
              <li>Phone number or email address.</li>
              <li>Squad/team name and participant-related information.</li>
              <li>Registration status and event participation records.</li>
              <li>Any additional information you voluntarily provide through the form (such as National ID front/back photos for identity verification).</li>
            </ul>
            <p className="text-amber-400/90 font-mono text-xs pt-1 flex items-center gap-1.5">
              <AlertTriangleIcon className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Please do not submit passwords, payment card details, or unnecessary sensitive personal information through the registration form.</span>
            </p>
          </section>

          {/* Section 3 */}
          <section className="p-6 rounded-xl bg-[#111111] border border-white/5 space-y-3">
            <h2
              className="text-lg sm:text-xl font-bold tracking-wider uppercase text-[#CCFF00] flex items-center gap-2"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              <span>3.</span> HOW WE USE YOUR INFORMATION
            </h2>
            <p>We use registration information only for legitimate event-related purposes, including:</p>
            <ul className="list-disc list-inside space-y-1.5 text-[#aaaaaa] pl-2">
              <li>Confirming registrations and contacting participants.</li>
              <li>Managing attendance and participant lists.</li>
              <li>Organizing community schedules, team rosters, gathering activities, and session plans.</li>
              <li>Communicating event announcements, changes, and safety information.</li>
              <li>Preventing duplicate, fraudulent, or invalid registrations.</li>
              <li>Verifying eligibility where necessary and lawful.</li>
              <li>Preparing event reports and participation statistics.</li>
            </ul>
            <p className="font-semibold text-white pt-1">
              We will not sell participants’ personal information.
            </p>
          </section>

          {/* Section 4 */}
          <section className="p-6 rounded-xl bg-[#111111] border border-white/5 space-y-3">
            <h2
              className="text-lg sm:text-xl font-bold tracking-wider uppercase text-[#CCFF00] flex items-center gap-2"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              <span>4.</span> OFFICIAL PUBG MOBILE HQ OPERATION &amp; GOVERNANCE
            </h2>
            <p>
              This website, event operations, community rules, and assemblies are officially controlled and operated under PUBG MOBILE HQ. All participant registrations and gathering logistics are administered in accordance with official PUBG MOBILE HQ guidelines and standards.
            </p>
            <p>
              All PUBG MOBILE trademarks, assets, logos, and related game intellectual properties utilized on this website and during the event are officially governed under PUBG MOBILE HQ and Krafton, Inc.
            </p>
          </section>

          {/* Section 5 */}
          <section className="p-6 rounded-xl bg-[#111111] border border-white/5 space-y-3">
            <h2
              className="text-lg sm:text-xl font-bold tracking-wider uppercase text-[#CCFF00] flex items-center gap-2"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              <span>5.</span> SHARING OF INFORMATION
            </h2>
            <p>
              Access to registration information will be limited to authorized members of the organizing team who need it to manage the event.
            </p>
            <p>
              Where necessary, relevant information may be shared with confirmed event partners, tournament administrators, or service providers supporting registration and event operations. Information will only be shared for an appropriate purpose and subject to applicable requirements.
            </p>
            <p>
              Participant information will not be publicly displayed unless necessary for the event and appropriately disclosed—for example, publishing tournament brackets, team names, or results.
            </p>
          </section>

          {/* Section 6 */}
          <section className="p-6 rounded-xl bg-[#111111] border border-white/5 space-y-3">
            <h2
              className="text-lg sm:text-xl font-bold tracking-wider uppercase text-[#CCFF00] flex items-center gap-2"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              <span>6.</span> DATA PROTECTION AND SECURITY
            </h2>
            <p>
              We will take reasonable measures to protect registration information against unauthorized access, disclosure, alteration, loss, or misuse.
            </p>
            <p>
              Only authorized personnel should have access to registration records. However, no website or electronic storage system can be guaranteed to be completely secure.
            </p>
          </section>

          {/* Section 7 */}
          <section className="p-6 rounded-xl bg-[#111111] border border-white/5 space-y-3">
            <h2
              className="text-lg sm:text-xl font-bold tracking-wider uppercase text-[#CCFF00] flex items-center gap-2"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              <span>7.</span> DATA RETENTION AND DELETION
            </h2>
            <p>
              Registration information will be retained only for as long as reasonably necessary to manage the event, address disputes, maintain required records, and meet applicable legal obligations.
            </p>
            <p>
              Participants may request access to, correction of, or deletion of their information by contacting our privacy team. Some records may need to be retained where legally required or necessary to resolve legitimate disputes.
            </p>
          </section>

          {/* Section 8 */}
          <section className="p-6 rounded-xl bg-[#111111] border border-white/5 space-y-3">
            <h2
              className="text-lg sm:text-xl font-bold tracking-wider uppercase text-[#CCFF00] flex items-center gap-2"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              <span>8.</span> PARTICIPANT RESPONSIBILITIES
            </h2>
            <p>By registering, you agree to:</p>
            <ul className="list-disc list-inside space-y-1.5 text-[#aaaaaa] pl-2">
              <li>Provide accurate and truthful information.</li>
              <li>Submit only information that you are authorized to provide.</li>
              <li>Avoid duplicate, fraudulent, or misleading registrations.</li>
              <li>Follow the published tournament rules and event instructions.</li>
              <li>Respect other participants, staff, organizers, and partners.</li>
              <li>Avoid cheating, match manipulation, harassment, or disruptive conduct.</li>
            </ul>
            <p className="text-red-400 text-xs font-mono pt-1">
              False or abusive registrations may be rejected or cancelled, subject to applicable rules and law.
            </p>
          </section>

          {/* Section 9 */}
          <section className="p-6 rounded-xl bg-[#111111] border border-white/5 space-y-3">
            <h2
              className="text-lg sm:text-xl font-bold tracking-wider uppercase text-[#CCFF00] flex items-center gap-2"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              <span>9.</span> REGISTRATION DOES NOT GUARANTEE ADMISSION
            </h2>
            <p>
              Submitting the registration form does not automatically guarantee acceptance, a tournament slot, entry to a venue, or eligibility for a prize.
            </p>
            <p>
              Registrations may be subject to capacity limits, eligibility requirements, verification, and confirmation by the organizing team. Any rejection or cancellation will be handled according to the published event rules and applicable law.
            </p>
          </section>

          {/* Section 10 */}
          <section className="p-6 rounded-xl bg-[#111111] border border-white/5 space-y-3">
            <h2
              className="text-lg sm:text-xl font-bold tracking-wider uppercase text-[#CCFF00] flex items-center gap-2"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              <span>10.</span> MINORS
            </h2>
            <p>
              Participants who are under the age of 18 must meet the event’s age requirements and obtain parent or legal guardian consent where required.
            </p>
            <p>
              We will not knowingly collect unnecessary personal information from children. If you believe a child has submitted information without appropriate authorization, contact us so we can review the situation.
            </p>
          </section>

          {/* Section 11 */}
          <section className="p-6 rounded-xl bg-[#111111] border border-white/5 space-y-3">
            <h2
              className="text-lg sm:text-xl font-bold tracking-wider uppercase text-[#CCFF00] flex items-center gap-2"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              <span>11.</span> PHOTOGRAPHY AND EVENT MEDIA
            </h2>
            <p>
              The event may include photography, video recording, livestreaming, and publication of tournament results or event highlights.
            </p>
            <p>
              Where identifiable participants may be featured in promotional media, we will provide appropriate notice and obtain consent where required. Participants may contact the organizing team with questions or requests concerning their appearance in published media.
            </p>
          </section>

          {/* Section 12 */}
          <section className="p-6 rounded-xl bg-[#111111] border border-white/5 space-y-3">
            <h2
              className="text-lg sm:text-xl font-bold tracking-wider uppercase text-[#CCFF00] flex items-center gap-2"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              <span>12.</span> CHANGES TO THIS POLICY
            </h2>
            <p>
              We may update this policy when registration procedures, event requirements, or applicable laws change. The latest version will be published on this website with its effective date.
            </p>
          </section>

          {/* Section 13 */}
          <section className="p-6 rounded-xl bg-[#111111] border border-white/5 space-y-3">
            <h2
              className="text-lg sm:text-xl font-bold tracking-wider uppercase text-[#CCFF00] flex items-center gap-2"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              <span>13.</span> CONTACT US
            </h2>
            <p>For registration questions, privacy requests, corrections, or complaints, contact:</p>
            <div className="p-4 rounded-lg bg-black/50 border border-white/10 font-mono text-xs space-y-1.5 text-[#aaaaaa]">
              <div><strong className="text-white">Organizer:</strong> PUBG MOBILE COMMUNITY ASSEMBLY Organizing Team</div>
              <div><strong className="text-white">Email:</strong> pubgmethiopia.et@gmail.com</div>
              <div><strong className="text-white">Location:</strong> Addis Ababa, Ethiopia</div>
            </div>
          </section>
        </div>

        {/* Footer with Official Partner Logos (Left Bottom) */}
        <div className="mt-14 pt-8 border-t border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 text-xs font-sans text-neutral-400">
          <div className="flex flex-col items-start gap-2.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/krafton-partner-logos.png"
              alt="KRAFTON | LEVEL INFINITE | LIGHTSPEED STUDIOS"
              className="h-8 sm:h-9 w-auto object-contain opacity-95 hover:opacity-100 transition-opacity"
            />
            <p className="text-[11px] text-neutral-400">
              Official PUBG MOBILE Community Assembly • Officially Controlled and Operated under PUBG MOBILE HQ
            </p>
          </div>
          <div className="flex items-center gap-6 font-medium text-xs self-start md:self-center">
            <Link href="/" className="hover:text-white transition-colors" style={{ color: '#CCFF00' }}>
              ← Return to Home Page
            </Link>
            <span className="text-white/20">•</span>
            <Link href="/register" className="hover:underline text-white">
              Proceed to Registration →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
