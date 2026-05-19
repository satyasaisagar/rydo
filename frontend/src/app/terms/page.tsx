import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
export const metadata = { title: 'Terms of Service — Rydo' };

const sections = [
  {
    title: '1. Acceptance of Terms',
    body: `By accessing or using the Rydo platform ("Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service. Rydo reserves the right to update these terms at any time, and continued use of the Service constitutes acceptance of the updated terms.`,
  },
  {
    title: '2. Description of Service',
    body: `Rydo is a peer-to-peer ride-sharing platform that connects drivers ("Riders") with passengers ("Passengers") for shared intercity and intracity travel. Rydo acts solely as an intermediary and is not a transportation provider. All ride arrangements are between Riders and Passengers directly.`,
  },
  {
    title: '3. User Accounts',
    body: `You must create an account to use the Service. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must provide accurate, current, and complete information during registration. Rydo reserves the right to suspend or terminate accounts that violate these terms.`,
  },
  {
    title: '4. Rider Responsibilities',
    body: `Riders must hold a valid driver's license and vehicle registration. Riders are solely responsible for ensuring their vehicle is roadworthy, insured, and compliant with all applicable laws. Rydo does not verify the accuracy of information provided by Riders and makes no warranties regarding any Rider's qualifications.`,
  },
  {
    title: '5. Passenger Responsibilities',
    body: `Passengers are responsible for their behaviour during rides. Passengers must arrive at the agreed pickup point on time and treat Riders and fellow passengers with respect. Rydo reserves the right to suspend accounts of Passengers who behave inappropriately.`,
  },
  {
    title: '6. Payments',
    body: `Ride costs are set by Riders and represent a fair cost-sharing contribution, not a commercial fare. Payments made through the platform are processed by third-party payment providers. Rydo is not responsible for payment disputes between Riders and Passengers.`,
  },
  {
    title: '7. Ratings & Reviews',
    body: `After each completed ride, users may rate and review each other. Reviews must be honest and based on actual experiences. Rydo reserves the right to remove reviews that contain false information, hate speech, or violate community guidelines.`,
  },
  {
    title: '8. Prohibited Conduct',
    body: `Users must not: use the Service for commercial transportation; misrepresent their identity; engage in harassment, discrimination, or abuse; transport illegal substances or weapons; use the platform for any unlawful purpose; or attempt to circumvent Rydo's safety or payment systems.`,
  },
  {
    title: '9. Limitation of Liability',
    body: `To the fullest extent permitted by law, Rydo shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Service, including but not limited to accidents, injuries, or losses during rides. Your use of the Service is at your own risk.`,
  },
  {
    title: '10. Governing Law',
    body: `These Terms shall be governed by and construed in accordance with the laws of India. Any disputes arising from these terms shall be subject to the exclusive jurisdiction of the courts in Mumbai, Maharashtra.`,
  },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <Navbar />
      <div className="pt-28 pb-20 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="mb-12">
            <p className="text-[#00C853] text-sm font-semibold uppercase tracking-wider mb-3">Legal</p>
            <h1 className="text-4xl font-bold text-white mb-4">Terms of Service</h1>
            <p className="text-white/40">Last updated: January 1, 2025</p>
          </div>

          <div className="space-y-10">
            {sections.map(({ title, body }) => (
              <div key={title}>
                <h2 className="text-white font-semibold text-lg mb-3">{title}</h2>
                <p className="text-white/50 leading-relaxed">{body}</p>
              </div>
            ))}
          </div>

          <div className="mt-16 p-6 bg-[#111111] border border-white/[0.06] rounded-2xl">
            <p className="text-white/60 text-sm leading-relaxed">
              For questions about these Terms of Service, contact us at{' '}
              <a href="mailto:legal@rydo.app" className="text-[#00C853] hover:underline">legal@rydo.app</a>
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
