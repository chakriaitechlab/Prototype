import Link from 'next/link';


const LAST_UPDATED = '13 September 2026';

export function PrivacyView() {
  return (
    <section className="jp-legal">
      <div className="jp-container">
        <div className="jp-legal-inner">
          <p className="jp-legal-eyebrow">Legal &amp; Privacy</p>
          <h1 className="jp-legal-title">Privacy Policy</h1>
          <p className="jp-legal-updated">Last updated: {LAST_UPDATED}</p>

          <p className="jp-legal-lead">
            At Chakri.ai (&ldquo;Chakri,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;),
            we respect your personal privacy and are committed to protecting the data you share with us.
            This Privacy Policy explains how we collect, use, process, and safeguard personal information
            across our website, AI job matching tools, recruiter workspace, and career services.
          </p>

          <nav className="jp-legal-toc" aria-label="Privacy policy table of contents">
            <a href="#collection">1. Information We Collect</a>
            <a href="#usage">2. How We Use Information</a>
            <a href="#ai-processing">3. AI &amp; Resume Processing</a>
            <a href="#sharing">4. Information Sharing</a>
            <a href="#storage-security">5. Storage &amp; Security</a>
            <a href="#your-rights">6. Your Rights &amp; Choices</a>
            <a href="#cookies">7. Cookies &amp; Sessions</a>
            <a href="#third-parties">8. Third-Party Integrations</a>
            <a href="#changes">9. Policy Updates</a>
            <a href="#contact">10. Contact Us</a>
          </nav>

          <article className="jp-legal-body">
            <h2 id="collection">1. Information We Collect</h2>
            <p>
              We collect information to deliver effective career and recruitment services tailored to the Bangladesh
              job market and global remote opportunities.
            </p>

            <h3>1.1 Information Provided by Job Seekers (Candidates)</h3>
            <ul>
              <li>
                <strong>Account Credentials:</strong> Name, email address, phone number, password hash, and optional profile image.
              </li>
              <li>
                <strong>Resume &amp; Career History:</strong> Uploaded CVs/resumes (PDF, DOCX), education background, employment history,
                technical and soft skills, portfolio links (such as GitHub, LinkedIn, or personal website), and professional certifications.
              </li>
              <li>
                <strong>Applications &amp; Preferences:</strong> Jobs applied for, answers to employer screening questionnaires, target roles,
                salary expectations, and preferred job locations (e.g., Dhaka, Chattogram, remote).
              </li>
              <li>
                <strong>AI &amp; Interactive Features:</strong> Text prompts used during CV tailoring, mock interview responses,
                and session feedback.
              </li>
            </ul>

            <h3>1.2 Information Provided by Employers &amp; Recruiters</h3>
            <ul>
              <li>
                <strong>Organization Details:</strong> Company name, trade license or corporate verification details, website, company logo,
                office address, industry, and organizational size.
              </li>
              <li>
                <strong>Recruiter Profile:</strong> Name, official business email, designation, and contact details.
              </li>
              <li>
                <strong>Job Postings:</strong> Role descriptions, requirements, compensation ranges, deadlines, and internal evaluation notes
                on candidate applicants.
              </li>
              <li>
                <strong>Billing Information:</strong> Transaction histories for credits or Pro subscriptions processed through secure,
                PCI-compliant payment gateways. We never store raw credit card numbers or banking passwords on our servers.
              </li>
            </ul>

            <h3>1.3 Automatically Collected Technical Data</h3>
            <p>
              When you browse Chakri.ai, our servers automatically record standard connection metrics, including your IP address,
              browser type and version, operating system, referring URLs, device identifiers, and timestamps.
            </p>

            <h2 id="usage">2. How We Use Information</h2>
            <p>We use your personal information strictly for legitimate operational purposes, including:</p>
            <ul>
              <li>Enabling candidates to build AI-tailored CVs, discover matching jobs, and submit applications directly to employers.</li>
              <li>Allowing employers to publish verified job circulars, screen candidates using semantic AI, and manage talent pipelines.</li>
              <li>Powering assistive AI features, including candidate match scoring, interview practice simulations, and skill gap analyses.</li>
              <li>Sending crucial operational notifications, such as application status updates, interview invitations, and security alerts.</li>
              <li>Maintaining platform integrity, preventing fraudulent job postings, unauthorized automated scraping, and spam accounts.</li>
              <li>Complying with applicable laws, regulations, and legal obligations in Bangladesh.</li>
            </ul>

            <h2 id="ai-processing">3. AI &amp; Resume Processing</h2>
            <p>
              Chakri.ai uses state-of-the-art artificial intelligence models (such as Google Gemini) to assist both candidates and employers:
            </p>
            <ul>
              <li>
                <strong>Resume Parsing &amp; Structuring:</strong> When you upload a CV, our AI parses text into structured skills,
                experience, and education to enhance searchability and matching accuracy.
              </li>
              <li>
                <strong>Candidate Match Scoring:</strong> AI evaluates candidates against job descriptions to provide explainable match scores
                and summaries to recruiters. These scores serve as decision-support tools; final hiring decisions remain human-driven.
              </li>
              <li>
                <strong>Data Privacy in AI:</strong> Your private CV documents and confidential data are processed securely through private API
                endpoints and are <strong>never sold</strong> to data brokers or used to train public foundation models without your explicit consent.
              </li>
            </ul>

            <h2 id="sharing">4. Information Sharing</h2>
            <p>
              We respect your trust and do not sell, rent, or trade your personal data. We only share information under the following limited circumstances:
            </p>
            <ul>
              <li>
                <strong>With Prospective Employers:</strong> When you apply for a job posting, the recruiting organization gains access to your submitted
                CV, profile details, screening answers, and contact info to evaluate your candidacy.
              </li>
              <li>
                <strong>Trusted Infrastructure Providers:</strong> We collaborate with reputable service partners (cloud hosting, database providers such as
                Supabase/PostgreSQL, transactional email services, and secure AI inference APIs) bound by strict confidentiality and data-protection agreements.
              </li>
              <li>
                <strong>Legal &amp; Regulatory Compliance:</strong> We may disclose information if required by applicable Bangladesh law, court order,
                or governmental authority, or to protect the safety, rights, and property of Chakri.ai and its users.
              </li>
            </ul>

            <h2 id="storage-security">5. Data Storage &amp; Security</h2>
            <p>
              We implement industry-standard technical and organizational safeguards to protect your personal information against unauthorized access,
              loss, alteration, or disclosure. All data in transit is encrypted using modern Transport Layer Security (TLS/HTTPS). Stored passwords
              are cryptographically hashed, and database access is restricted by least-privilege security policies.
            </p>
            <p>
              We retain personal data as long as your account is active to facilitate your ongoing job search or hiring activities. You may delete
              individual CVs or request full account termination at any time.
            </p>

            <h2 id="your-rights">6. Your Rights &amp; Choices</h2>
            <p>You have full control over your personal information on Chakri.ai:</p>
            <ul>
              <li><strong>Access &amp; Edit:</strong> You can view, update, or edit your personal profile and job preferences via your dashboard at any time.</li>
              <li><strong>Resume Management:</strong> You can upload new CVs, set an active master CV, or delete previous versions whenever you choose.</li>
              <li><strong>Account Deletion:</strong> You have the right to request complete account deletion. Upon verification, we will permanently purge your profile, CVs, and personal records from our active systems.</li>
              <li><strong>Communication Preferences:</strong> You can manage notification settings or unsubscribe from non-transactional marketing communications using the link provided in our emails.</li>
            </ul>

            <h2 id="cookies">7. Cookies &amp; Sessions</h2>
            <p>
              We use essential HTTP cookies and local storage tokens strictly necessary for secure user authentication, remembering active sessions,
              and maintaining user security. We do not employ third-party cross-site advertising trackers that monitor your activity outside Chakri.ai.
            </p>

            <h2 id="third-parties">8. Third-Party Integrations</h2>
            <p>
              Our platform may contain links to external websites (such as employer company sites, portfolio links, or regulatory resources).
              We are not responsible for the privacy practices or content of third-party websites, and we encourage you to review their respective policies.
            </p>

            <h2 id="changes">9. Policy Updates</h2>
            <p>
              We may update this Privacy Policy from time to time to reflect enhancements to our services, new feature rollouts, or evolving legal
              standards. When changes are made, we will update the &ldquo;Last updated&rdquo; date at the top of this page. Significant changes will
              be communicated through an in-app notice or email announcement.
            </p>

            <h2 id="contact">10. Contact Us</h2>
            <p>
              If you have any questions, concerns, or data requests regarding this Privacy Policy, please contact our team:
            </p>
            <ul>
              <li><strong>Email:</strong> <a href="mailto:support@chakri.ai">support@chakri.ai</a></li>
              <li><strong>Phone:</strong> +880 9611-234567</li>
              <li><strong>Location:</strong> Gulshan, Dhaka 1212, Bangladesh</li>
            </ul>

            <div className="jp-legal-note">
              <strong>Need help with your account?</strong> Our support team is available to assist candidates and employers with privacy inquiries,
              data exports, or profile settings. Visit our <Link href="/support">Support Center</Link> for direct assistance.
            </div>
          </article>

          <div className="jp-legal-actions">
            <Link href="/terms" className="jp-btn jp-btn--outline">
              Terms of Service
            </Link>
            <Link href="/support" className="jp-btn jp-btn--soft">
              Contact Support
            </Link>
            <Link href="/" className="jp-btn jp-btn--soft">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
