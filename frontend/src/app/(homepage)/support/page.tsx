import type { Metadata } from 'next';
import { Clock, Mail, MapPin, Phone } from 'lucide-react';
import { SupportForm } from '@/components/homepage/support/SupportForm';

const SUPPORT_EMAIL = 'support@chakriai.com';
const SUPPORT_PHONE = '+880 1771-259478';
const SUPPORT_ADDRESS = 'Gulshan, Dhaka 1212, Bangladesh';

export const metadata: Metadata = {
  title: 'Support | Chakri.ai - AI-Powered Recruitment Platform',
  description:
    'Get help with Chakri.ai — contact our support team by email, phone, or message, and find answers to common questions.',
};

const SUPPORT_FAQS = [
  {
    q: 'How do I reset my password?',
    a: 'Go to the Sign In page and click “Forget password?”. We will email you a reset code — enter it with your new password and you are back in.',
  },
  {
    q: 'How do I verify my email address?',
    a: 'After signing up we send a verification code to your inbox. Enter it on the verification page, or use “Resend code” if it did not arrive within a few minutes.',
  },
  {
    q: 'How does Smart Apply work?',
    a: 'Add jobs to your apply queue and Chakri submits applications on your behalf with a CV and cover letter tailored to each role. You can review everything before it goes out.',
  },
  {
    q: 'I am an employer — how do I post a job?',
    a: 'Create an employer account, open your dashboard, and click “Post A Job”. Describe the role and Chakri structures the requirements, screening questions, and pipeline automatically.',
  },
  {
    q: 'How do refunds work for coin purchases?',
    a: 'Unused coin packs purchased within the last 14 days are fully refundable. Contact support with your order ID and we will process it within 3–5 business days.',
  },
];

export default function SupportPage() {
  return (
    <>
      <section className="jp-section" style={{ paddingTop: '2.5rem' }}>
        <div className="jp-container">
          <div className="jp-contact-grid">
            {/* Contact Info Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="jp-contact-card">
                <div className="jp-contact-icon">
                  <Mail size={20} />
                </div>
                <div>
                  <h3>Email us</h3>
                  <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
                  <p>We reply within 1 business day.</p>
                </div>
              </div>

              <div className="jp-contact-card">
                <div className="jp-contact-icon">
                  <Phone size={20} />
                </div>
                <div>
                  <h3>Call us</h3>
                  <a href={`tel:${SUPPORT_PHONE.replace(/\s/g, '')}`}>{SUPPORT_PHONE}</a>
                  <p>Saturday–Thursday, 9am–6pm (GMT+6)</p>
                </div>
              </div>

              <div className="jp-contact-card">
                <div className="jp-contact-icon">
                  <MapPin size={20} />
                </div>
                <div>
                  <h3>Visit us</h3>
                  <p>{SUPPORT_ADDRESS}</p>
                </div>
              </div>

              <div className="jp-contact-card">
                <div className="jp-contact-icon">
                  <Clock size={20} />
                </div>
                <div>
                  <h3>Response times</h3>
                  <p>Pro subscribers get priority support with responses under 4 hours.</p>
                </div>
              </div>
            </div>

            {/* Contact Form Card */}
            <div className="jp-filter-card">
              <h2 style={{ margin: '0 0 0.375rem', fontSize: '1.25rem', fontWeight: 500 }}>
                Send us a message
              </h2>
              <p style={{ margin: '0 0 1.5rem', color: 'var(--jp-gray-500)', fontSize: '0.9375rem' }}>
                Tell us what you need help with and our team will get back to you.
              </p>

              <SupportForm />
            </div>
          </div>
        </div>
      </section>

      {/* Support FAQ */}
      <section className="jp-section jp-section--muted" id="faq">
        <div className="jp-container">
          <h2 className="jp-section-title jp-section-title--center">Frequently asked questions</h2>
          <div className="jp-faq">
            {SUPPORT_FAQS.map((item) => (
              <details key={item.q}>
                <summary>{item.q}</summary>
                <div className="jp-faq-body">{item.a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
