import { FileText, MessageCircle, ShieldCheck } from 'lucide-react';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';
import { buildWhatsAppLink, publicContactConfig } from '../lib/contactConfig';

const pages = {
  privacy: {
    eyebrow: 'Privacy notice',
    title: 'How project information is handled.',
    intro: 'This MVP notice explains how NerdyFren handles account, booking, payment, delivery, and support information.',
    sections: [
      ['Information we collect', 'We may collect account details, contact information, project briefs, service selections, payment references, revision notes, delivery links, and operational activity needed to run the marketplace.'],
      ['Google Drive and project links', 'NerdyFren stores project metadata and authorized links. Raw files, references, working files, final deliveries, revisions, and payment proofs may remain in client-owned or NerdyFren-managed Google Drive folders.'],
      ['How information is used', 'Information is used to manage bookings, assign editors, confirm payments, deliver work, process revisions, provide support, protect accounts, and maintain an operational audit trail.'],
      ['Access and sharing', 'Private project links should be available only to the client, the assigned editor, and authorized admins or super admins. We do not intentionally publish private Drive links on public pages.'],
      ['Security and retention', 'We use reasonable MVP safeguards, role-based access, private tracking identifiers, and service-provider controls. Retention and deletion practices will be finalized with the approved legal policy.'],
    ],
  },
  terms: {
    eyebrow: 'Terms of service',
    title: 'Clear expectations for managed creative work.',
    intro: 'These MVP terms describe the working rules for bookings, payments, project materials, delivery, approvals, and revisions.',
    sections: [
      ['Marketplace service', 'NerdyFren coordinates creative services between clients and verified editors or specialists. Scope, timing, pricing, and revision allowances depend on the selected service and confirmed project brief.'],
      ['Client materials and links', 'Clients must provide lawful materials and working access to source and reference links. Clients remain responsible for permissions relating to footage, music, trademarks, and other supplied content.'],
      ['Payments and assignment', 'Projects may remain pending until payment is confirmed. Editor assignment, production, delivery, and revisions are tracked through the NerdyFren control panel.'],
      ['Delivery and revisions', 'Delivery links are shared through authorized project views. Revision requests should be specific and must follow the revision allowance and stage of the selected service.'],
      ['Account and tracking security', 'Users are responsible for protecting passwords and Request IDs. Do not share project access with anyone who should not see the project.'],
      ['Service limits', 'Timelines may change when briefs, access, approvals, or source materials are incomplete. Final legal terms, liability limits, and jurisdiction require client and qualified legal approval.'],
    ],
  },
  refund: {
    eyebrow: 'Refund and dispute policy',
    title: 'A practical review process for service concerns.',
    intro: 'Refund and dispute requests are reviewed case-by-case by NerdyFren operations.',
    sections: [
      ['Before work begins', 'Contact support as soon as possible if a project must be cancelled. Eligibility depends on payment status, assignment, work already completed, and costs already incurred.'],
      ['After work starts', 'A full refund is not automatic once an editor has been assigned or production has started. NerdyFren may offer a revision, partial adjustment, reassignment, credit, or another resolution after review.'],
      ['After delivery or approval', 'Refunds are generally not available after work has been delivered or approved unless an exception is approved by an authorized admin.'],
      ['Revision process', 'Available revision cycles should be used for reasonable changes within the agreed brief. New scope, new source material, or a materially different creative direction may require an additional quote.'],
      ['How to request a review', 'Provide the Request ID, payment reference, a concise explanation, and relevant evidence through official support. Do not post private project or payment links publicly.'],
    ],
  },
};

export default function LegalPage({ type }) {
  const page = pages[type] || pages.privacy;
  const whatsappHref = buildWhatsAppLink(`Hi NerdyFren, I need help with the ${page.eyebrow}.`);
  const supportEmail = publicContactConfig.supportEmail;

  return (
    <div className="min-h-screen bg-canvas">
      <Navbar />
      <main className="aurora pb-24 pt-32">
        <div className="container-shell max-w-4xl">
          <div className="text-center">
            <span className="eyebrow"><FileText size={13} /> {page.eyebrow}</span>
            <h1 className="mt-6 text-4xl font-extrabold tracking-tight sm:text-6xl">{page.title}</h1>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-slate-400">{page.intro}</p>
          </div>

          <div className="mt-12 rounded-2xl border border-amber-400/20 bg-amber-500/10 p-5 text-sm leading-6 text-amber-100">
            <strong>MVP legal placeholder:</strong> This page is operational guidance, not final legal advice.
            It requires final client and qualified legal approval before public launch.
          </div>

          <div className="mt-6 space-y-4">
            {page.sections.map(([title, body]) => (
              <section key={title} className="panel p-6 sm:p-8">
                <h2 className="flex items-center gap-3 text-lg font-semibold">
                  <ShieldCheck size={18} className="text-violet-300" />
                  {title}
                </h2>
                <p className="mt-4 text-sm leading-7 text-slate-400">{body}</p>
              </section>
            ))}
          </div>

          <section className="panel mt-6 p-6 sm:p-8">
            <h2 className="text-lg font-semibold">Questions or support</h2>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              Contact NerdyFren through an official support channel and include your Request ID when applicable.
            </p>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              {whatsappHref && (
                <a href={whatsappHref} target="_blank" rel="noreferrer" className="btn-primary">
                  <MessageCircle size={16} /> Contact support
                </a>
              )}
              {supportEmail && (
                <a href={`mailto:${supportEmail}`} className="btn-secondary">
                  {supportEmail}
                </a>
              )}
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
