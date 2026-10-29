import Link from 'next/link';


const LAST_UPDATED = '13 September 2026';

export function TermsView() {
  return (
    <section className="jp-legal">
      <div className="jp-container">
        <div className="jp-legal-inner">
          <p className="jp-legal-eyebrow">Legal &amp; Compliance</p>
          <h1 className="jp-legal-title">Terms of Service</h1>
          <p className="jp-legal-updated">Last updated: {LAST_UPDATED}</p>

          <p className="jp-legal-lead">
            These Terms of Service (&ldquo;Terms&rdquo;) govern your access to and use of Chakri.ai
            (&ldquo;Chakri,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;), including our
            website, AI job matching and screening tools, recruiter workspaces, applicant tracking system,
            credits, and related services (collectively, the &ldquo;Services&rdquo;). By accessing, registering,
            or using Chakri.ai, you agree to be bound by these Terms and our{' '}
            <Link href="/privacy">Privacy Policy</Link>.
          </p>

          <nav className="jp-legal-toc" aria-label="Terms of service table of contents">
            <a href="#eligibility">1. Eligibility &amp; Accounts</a>
            <a href="#platform-services">2. Platform &amp; Services</a>
            <a href="#candidates">3. Job Seeker Terms</a>
            <a href="#employers">4. Employer &amp; Recruiter Terms</a>
            <a href="#ai-disclaimer">5. AI Assistive Disclaimers</a>
            <a href="#credits-plans">6. Plans, Credits &amp; Payments</a>
            <a href="#acceptable-use">7. Acceptable Use Policy</a>
            <a href="#intellectual-property">8. Intellectual Property</a>
            <a href="#liability">9. Limitation of Liability</a>
            <a href="#termination">10. Suspension &amp; Termination</a>
            <a href="#governing-law">11. Governing Law</a>
            <a href="#modifications">12. Modifications</a>
            <a href="#contact">13. Contact Information</a>
          </nav>

          <article className="jp-legal-body">
            <h2 id="eligibility">1. Eligibility &amp; Accounts</h2>
            <p>
              To use Chakri.ai, you must be at least 18 years of age or the legal age of majority in your jurisdiction.
              By creating an account, you represent and warrant that you have the legal capacity to enter into a binding contract.
            </p>
            <p>
              You are responsible for maintaining the confidentiality of your login credentials and for all activities that occur
              under your account. You agree to notify us immediately at <a href="mailto:support@chakri.ai">support@chakri.ai</a> if
              you discover or suspect any unauthorized access or security breach.
            </p>

            <h2 id="platform-services">2. Platform &amp; Services</h2>
            <p>
              Chakri.ai is an intelligent talent matching and recruitment platform connecting candidates with verified hiring employers
              across Bangladesh and international remote opportunities. Key features include:
            </p>
            <ul>
              <li>Job circular publishing, discovery, filtering, and categorization.</li>
              <li>AI-powered resume parsing, CV tailoring, and semantic talent search.</li>
              <li>Interactive AI interview prep and performance feedback modules.</li>
              <li>Applicant tracking, recruiter pipelines, and candidate communication.</li>
              <li>Coin credit packages and Pro subscription tiers.</li>
            </ul>
            <p>
              We continually improve our platform. We reserve the right to modify, update, suspend, or discontinue any feature,
              in whole or in part, at any time with or without prior notice.
            </p>

            <h2 id="candidates">3. Job Seeker Terms</h2>
            <p>As a candidate on Chakri.ai, you agree to the following conditions:</p>
            <ul>
              <li>
                <strong>Authentic Credentials:</strong> All information in your profile, uploaded CVs, certifications, and application
                materials must be accurate, truthful, and representative of your actual qualifications and experience.
              </li>
              <li>
                <strong>Lawful Applications:</strong> You will only apply for positions for which you possess genuine interest and intend
                to engage with employers professionally.
              </li>
              <li>
                <strong>Free Access:</strong> Candidate account creation, job search, and fundamental career tools are completely free
                during our seed round with no credit card required.
              </li>
              <li>
                <strong>No Guarantees:</strong> While Chakri.ai facilitates discovery and AI-assisted applications, we do not guarantee
                interview selections, job offers, or specific employment outcomes.
              </li>
            </ul>

            <h2 id="employers">4. Employer &amp; Recruiter Terms</h2>
            <p>As an employer or recruiter utilizing Chakri.ai to post vacancies and source talent, you agree:</p>
            <ul>
              <li>
                <strong>Legitimate Vacancies Only:</strong> You will only post genuine, authorized, and active employment or internship
                opportunities. Postings that involve multi-level marketing (MLM), pyramid schemes, or illegal activities are strictly prohibited.
              </li>
              <li>
                <strong>Zero Candidate Fees:</strong> Under no circumstances may an employer or recruiter charge applicants application fees,
                processing charges, training fees, or equipment security deposits. Violations result in immediate permanent account termination.
              </li>
              <li>
                <strong>Labor Law Compliance:</strong> All postings and hiring workflows must comply with the Bangladesh Labour Act, 2006
                (and amendments) or relevant local employment standards, including non-discrimination on grounds of race, religion, gender, or disability.
              </li>
              <li>
                <strong>Candidate Data Protection:</strong> Candidate resumes and contact details accessed through Chakri.ai may only be used
                for legitimate recruitment purposes for the specific role advertised and must not be distributed, sold, or misused.
              </li>
            </ul>

            <h2 id="ai-disclaimer">5. AI Assistive Disclaimers</h2>
            <p>
              Our artificial intelligence tools—including resume match scores, CV optimization recommendations, candidate summaries,
              and interview prep evaluations—are provided strictly on an <strong>assistive</strong> basis.
            </p>
            <ul>
              <li>
                AI match scores reflect automated algorithmic assessments against job criteria. They are intended as decision-support aids
                and should never replace human judgment in hiring decisions.
              </li>
              <li>
                While we strive for high accuracy, AI outputs may occasionally contain discrepancies or incomplete interpretations.
                Users must independently review AI-generated suggestions before submitting applications or making employment choices.
              </li>
              <li>
                Chakri.ai disclaims liability for any hiring, promotion, or rejection decisions made by employers in connection with AI scores or insights.
              </li>
            </ul>

            <h2 id="credits-plans">6. Plans, Credits &amp; Payments</h2>
            <p>
              Certain premium employer features (such as bulk AI screening, talent contact unlocking, and featured job highlights)
              may require Gold Coins or Pro subscriptions:
            </p>
            <ul>
              <li>Pricing details and coin allocations are clearly outlined on our <Link href="/pricing">Pricing Plans</Link> page.</li>
              <li>All payments are processed securely via encrypted payment gateways. Prices are in Bangladeshi Taka (BDT) or USD as indicated.</li>
              <li>Credits are non-transferable. Unused credits remain valid according to the plan terms purchased.</li>
              <li>Refund requests are evaluated on a case-by-case basis in accordance with our refund policy and applicable statutory consumer rights.</li>
            </ul>

            <h2 id="acceptable-use">7. Acceptable Use Policy</h2>
            <p>When using Chakri.ai, you agree that you will not:</p>
            <ul>
              <li>Use any robot, spider, scraper, or automated tool to extract jobs, resumes, or platform data without prior written consent.</li>
              <li>Transmit viruses, malware, trojans, or code designed to disrupt, damage, or compromise our infrastructure.</li>
              <li>Impersonate any individual, company, or entity, or misrepresent your affiliation with any person or organization.</li>
              <li>Interfere with or attempt to circumvent security controls, authentication tokens, rate limits, or account restrictions.</li>
              <li>Post offensive, defamatory, harassing, obscene, or fraudulent content.</li>
            </ul>

            <h2 id="intellectual-property">8. Intellectual Property</h2>
            <p>
              The Chakri.ai platform, including its brand, logos, software, UI design, code, graphics, algorithms, and documentation,
              is the exclusive property of Chakri.ai and protected by copyright, trademark, and intellectual property laws.
            </p>
            <p>
              You retain ownership of the content and resumes you submit to the platform. By submitting content, you grant Chakri.ai
              a worldwide, non-exclusive, royalty-free license to host, parse, index, and display such content solely for the purpose
              of providing and improving the Services.
            </p>

            <h2 id="liability">9. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, Chakri.ai, its founders, employees, and affiliates shall not be liable for any
              indirect, incidental, consequential, special, or punitive damages—including loss of profits, data, employment opportunities,
              or business interruption—arising from or related to your use of or inability to use the platform.
            </p>
            <p>
              The platform and all services are provided on an &ldquo;AS IS&rdquo; and &ldquo;AS AVAILABLE&rdquo; basis without warranties of
              any kind, either express or implied, including warranties of merchantability, fitness for a particular purpose, or non-infringement.
            </p>

            <h2 id="termination">10. Suspension &amp; Termination</h2>
            <p>
              We reserve the right to suspend, restrict, or terminate your account and access to the Services at our sole discretion,
              without liability or prior notice, if we determine that you have violated these Terms, engaged in fraudulent activities,
              or compromised the security or reputation of Chakri.ai.
            </p>

            <h2 id="governing-law">11. Governing Law &amp; Dispute Resolution</h2>
            <p>
              These Terms and any disputes arising out of or related to your use of Chakri.ai shall be governed by and construed in
              accordance with the laws of the People&rsquo;s Republic of Bangladesh. Any legal action or proceeding shall be brought exclusively
              before the competent courts located in Dhaka, Bangladesh.
            </p>

            <h2 id="modifications">12. Modifications to Terms</h2>
            <p>
              We may revise these Terms at any time. When modifications are posted, the updated date at the top of this document
              will reflect the revision. Your continued use of Chakri.ai following the posting of updated Terms constitutes your acceptance
              of the changes.
            </p>

            <h2 id="contact">13. Contact Information</h2>
            <p>
              For legal notices, terms inquiries, or support assistance, please reach out to our team:
            </p>
            <ul>
              <li><strong>Email:</strong> <a href="mailto:support@chakri.ai">support@chakri.ai</a></li>
              <li><strong>Phone:</strong> +880 9611-234567</li>
              <li><strong>Address:</strong> Gulshan, Dhaka 1212, Bangladesh</li>
            </ul>

            <div className="jp-legal-note">
              <strong>Need further assistance?</strong> You can review our <Link href="/privacy">Privacy Policy</Link> or visit our{' '}
              <Link href="/support">Support Center</Link> for questions regarding candidate accounts, job posts, or company verification.
            </div>
          </article>

          <div className="jp-legal-actions">
            <Link href="/privacy" className="jp-btn jp-btn--outline">
              Privacy Policy
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
