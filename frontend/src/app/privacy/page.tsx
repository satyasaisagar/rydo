import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
export const metadata = { title: 'Privacy Policy — Rydo' };

const sections = [
  { title: '1. Information We Collect', body: `We collect information you provide directly, including name, email address, phone number, profile photo, and vehicle details. We also collect usage data such as ride history, location data during active rides, device information, and communication logs between users.` },
  { title: '2. How We Use Your Information', body: `We use your information to provide and improve the Service, verify your identity, facilitate ride matching, process payments, send notifications, provide customer support, ensure platform safety, and comply with legal obligations.` },
  { title: '3. Location Data', body: `We collect location data to enable ride matching, display pickup/drop-off points, and show live ride progress. Location is collected only when the app is in use. You can disable location access in your device settings, though this may limit Service functionality.` },
  { title: '4. Information Sharing', body: `We share your information with other users as necessary to facilitate rides (e.g., your name and rating are visible to matched riders/passengers). We do not sell your personal information to third parties. We may share data with service providers who assist in operating our platform under strict confidentiality agreements.` },
  { title: '5. Data Security', body: `We implement industry-standard security measures including encryption in transit (HTTPS), hashed password storage (bcrypt), and access controls. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.` },
  { title: '6. Data Retention', body: `We retain your personal data as long as your account is active or as needed to provide the Service. You may request deletion of your account and associated data at any time by contacting support@rydo.app, subject to legal retention requirements.` },
  { title: '7. Cookies', body: `We use cookies and similar tracking technologies to maintain session state, remember preferences, and analyse usage. You can control cookie settings through your browser, though disabling cookies may affect Service functionality.` },
  { title: '8. Your Rights', body: `You have the right to access, correct, or delete your personal information. You may also object to or restrict certain processing. To exercise these rights, contact us at privacy@rydo.app. We will respond within 30 days.` },
  { title: '9. Children\'s Privacy', body: `The Service is not directed to individuals under 18 years of age. We do not knowingly collect personal information from minors. If we become aware that a minor has provided us with personal information, we will delete such information promptly.` },
  { title: '10. Changes to this Policy', body: `We may update this Privacy Policy periodically. We will notify you of material changes via email or in-app notification. Your continued use of the Service after changes take effect constitutes acceptance of the updated policy.` },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <Navbar />
      <div className="pt-28 pb-20 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="mb-12">
            <p className="text-[#00C853] text-sm font-semibold uppercase tracking-wider mb-3">Legal</p>
            <h1 className="text-4xl font-bold text-white mb-4">Privacy Policy</h1>
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
              For privacy-related questions, contact:{' '}
              <a href="mailto:privacy@rydo.app" className="text-[#00C853] hover:underline">privacy@rydo.app</a>
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
