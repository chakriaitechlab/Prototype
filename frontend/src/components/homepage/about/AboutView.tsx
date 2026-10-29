import Link from 'next/link';
import { ArrowRight, BarChart3, CheckCircle2, Compass, FileText, MessageSquare, Search, ShieldCheck, Sparkles, Users, Zap } from 'lucide-react';


export function AboutView() {
  return (
    <div className="w-full bg-white text-[#18191c] font-sans">
      {/* Top Banner Ribbon */}
      <div className="bg-[#e7f0fa] border-b border-[#cee0f5] text-[#0a65cc] text-center text-xs sm:text-[13px] font-medium py-2.5 px-4 flex items-center justify-center gap-2">
        <Sparkles size={15} className="shrink-0 text-[#0a65cc]" />
        <span>Bangladesh&apos;s first AI-powered hiring platform — built for job seekers and recruiters alike</span>
      </div>

      {/* Hero Section */}
      <header id="top" className="relative overflow-hidden pt-16 pb-16 lg:pt-20 lg:pb-20 bg-[#f7f8f9] border-b border-[#e4e5e8]">
        {/* Atmosphere Subtle Glows */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
          <span className="absolute -top-32 right-[8%] w-[420px] h-[420px] rounded-full bg-[#0a65cc]/10 blur-[90px]" />
          <span className="absolute -bottom-32 left-[4%] w-[380px] h-[380px] rounded-full bg-[#0a65cc]/8 blur-[90px]" />
        </div>

        {/* Background watermark */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-bold text-[min(32vw,480px)] text-[#18191c] opacity-[0.025] select-none pointer-events-none whitespace-nowrap"
          aria-hidden="true"
        >
          চাকরি
        </div>

        <div className="relative z-10 w-[92%] max-w-[1240px] mx-auto grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-12 lg:gap-14 items-center">
          <div>
            <p className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1 rounded-full bg-[#e7f0fa] text-[#0a65cc] border border-[#cee0f5] mb-5">
              <span className="bg-[#0a65cc] !text-white px-2 py-0.5 rounded text-[11px] font-bold" style={{ color: '#ffffff' }}>চাকরি</span>
              Bengali for &ldquo;job&rdquo;
            </p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[52px] font-bold tracking-tight text-[#18191c] leading-[1.12] mb-5">
              The right hire,
              <br />
              <span className="text-[#0a65cc]">matched — not searched.</span>
            </h1>
            <p className="text-base sm:text-lg text-[#5e6670] max-w-[48ch] mb-8 leading-relaxed">
              Chakri.ai screens resumes, ranks candidates, and recommends jobs with AI — so hiring teams save weeks, and job seekers stop guessing.
            </p>
            <div className="flex flex-wrap gap-3.5 mb-8">
              <Link
                href="/jobs"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg font-semibold text-sm sm:text-[15px] bg-[#0a65cc] !text-white hover:bg-[#094e9f] hover:!text-white transition-all shadow-sm"
                style={{ color: '#ffffff' }}
              >
                Explore Platform
                <ArrowRight size={16} className="text-white" />
              </Link>
              <a
                href="#services"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg font-semibold text-sm sm:text-[15px] bg-white text-[#18191c] border border-[#e4e5e8] hover:border-[#0a65cc] hover:text-[#0a65cc] transition-all shadow-sm"
              >
                See what it does
              </a>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs sm:text-[13px] text-[#767f8c]">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-[#0ba02c]" /> Resume screening
              </span>
              <span className="text-[#e4e5e8]">·</span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-[#0ba02c]" /> Candidate matching
              </span>
              <span className="text-[#e4e5e8]">·</span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-[#0ba02c]" /> Career assistant
              </span>
            </div>
          </div>

          {/* Hero Visual Match Demonstration */}
          <div className="relative h-[360px] sm:h-[420px] flex flex-col items-center justify-center">
            {/* Candidate Card */}
            <div className="absolute top-6 left-0 sm:left-4 w-[240px] sm:w-[260px] bg-white border border-[#e4e5e8] rounded-xl p-5 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2 h-2 rounded-full bg-[#0a65cc]" />
                <span className="text-[11px] font-semibold tracking-wider text-[#0a65cc] uppercase">CANDIDATE</span>
              </div>
              <div className="font-bold text-base text-[#18191c] mb-0.5">Rafiq Ahmed</div>
              <div className="text-[13px] text-[#5e6670] mb-3.5">ML Engineer · 3 yrs</div>
              <div className="flex flex-wrap gap-1.5">
                <span className="text-[11px] px-2.5 py-1 rounded bg-[#f1f2f4] text-[#464d61] font-medium">Python</span>
                <span className="text-[11px] px-2.5 py-1 rounded bg-[#f1f2f4] text-[#464d61] font-medium">NLP</span>
                <span className="text-[11px] px-2.5 py-1 rounded bg-[#f1f2f4] text-[#464d61] font-medium">Pandas</span>
              </div>
            </div>

            {/* Dashed Connecting Line */}
            <svg className="absolute inset-0 w-full h-full -z-1 pointer-events-none" viewBox="0 0 300 300" preserveAspectRatio="none">
              <path d="M 90 90 C 150 140, 150 160, 210 210" fill="none" stroke="#0a65cc" strokeWidth="2" strokeDasharray="5 6" opacity="0.4" />
            </svg>

            {/* Match Badge */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#0ba02c] !text-white font-semibold text-xs sm:text-[13px] py-2 px-4 rounded-full shadow-lg z-10 flex items-center gap-1.5 border border-white/20" style={{ color: '#ffffff' }}>
              <span>✓</span> 96% Match
            </div>

            {/* Job Card */}
            <div className="absolute bottom-6 right-0 sm:right-4 w-[240px] sm:w-[260px] bg-white border border-[#e4e5e8] rounded-xl p-5 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2 h-2 rounded-full bg-[#0ba02c]" />
                <span className="text-[11px] font-semibold tracking-wider text-[#0ba02c] uppercase">OPEN ROLE</span>
              </div>
              <div className="font-bold text-base text-[#18191c] mb-0.5">AI Engineer</div>
              <div className="text-[13px] text-[#5e6670] mb-3.5">TechNest Ltd · Dhaka</div>
              <div className="flex flex-wrap gap-1.5">
                <span className="text-[11px] px-2.5 py-1 rounded bg-[#f1f2f4] text-[#464d61] font-medium">ML</span>
                <span className="text-[11px] px-2.5 py-1 rounded bg-[#f1f2f4] text-[#464d61] font-medium">NLP</span>
                <span className="text-[11px] px-2.5 py-1 rounded bg-[#e7f0fa] text-[#0a65cc] font-medium">Remote</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* About & Mission Section */}
      <section id="about" className="py-20 lg:py-24 bg-white border-b border-[#e4e5e8]">
        <div className="w-[92%] max-w-[1240px] mx-auto grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-12 lg:gap-16 items-start">
          <div>
            <p className="text-xs uppercase font-bold tracking-wider text-[#0a65cc] mb-3">
              About us
            </p>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#18191c] leading-tight mb-5 max-w-[18ch]">
              Recruitment, rebuilt around evidence.
            </h2>
            <p className="text-[#5e6670] text-base sm:text-[17px] max-w-[56ch] mb-8 leading-relaxed">
              Chakri.ai is Bangladesh&apos;s first AI-powered hiring platform for job seekers and recruiters — connecting professionals with employers through intelligent candidate matching, automated resume screening, and data-driven hiring.
            </p>
            <div className="border-l-4 border-[#0a65cc] bg-[#f7f8f9] p-5 sm:p-6 rounded-r-xl">
              <p className="text-base sm:text-lg font-medium text-[#18191c] leading-relaxed mb-2">
                &ldquo;To become South Asia&apos;s leading AI-powered recruitment ecosystem — helping organizations hire better talent, and helping job seekers build careers that fit.&rdquo;
              </p>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#767f8c]">Our vision</span>
            </div>
          </div>

          <div className="bg-[#f7f8f9] border border-[#e4e5e8] rounded-xl p-6 sm:p-7">
            <p className="text-xs uppercase font-bold tracking-wider text-[#0a65cc] mb-4">
              Our Mission
            </p>
            <ul className="flex flex-col gap-3.5 text-sm sm:text-[15px] text-[#18191c]">
              {[
                'Automate recruitment with artificial intelligence',
                'Cut hiring time and recruitment cost',
                'Sharpen candidate-job matching accuracy',
                'Guide career growth with smart recommendations',
                'Keep the hiring process transparent, end to end',
              ].map((item, index) => (
                <li key={index} className="flex items-start gap-3 pb-3 border-b border-[#e4e5e8] last:border-b-0 last:pb-0">
                  <CheckCircle2 size={18} className="text-[#0a65cc] shrink-0 mt-0.5" />
                  <span className="text-[#464d61] font-medium">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Services (Bento Grid) */}
      <section id="services" className="py-20 lg:py-24 bg-[#f7f8f9] border-b border-[#e4e5e8]">
        <div className="w-[92%] max-w-[1240px] mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
            <div>
              <p className="text-xs uppercase font-bold tracking-wider text-[#0a65cc] mb-2.5">
                Features &amp; Services
              </p>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#18191c] max-w-[20ch]">
                Six ways Chakri.ai does the heavy lifting.
              </h2>
            </div>
            <p className="text-[#5e6670] text-sm sm:text-base max-w-[38ch]">
              Everything a hiring team or a job seeker needs, running on the same intelligence underneath.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Feature 1 */}
            <div className="bg-white border border-[#e4e5e8] rounded-xl p-6 sm:p-7 flex flex-col justify-between hover:border-[#0a65cc] hover:shadow-md transition-all group">
              <div className="w-12 h-12 rounded-lg bg-[#e7f0fa] text-[#0a65cc] flex items-center justify-center mb-5 group-hover:bg-[#0a65cc] group-hover:text-white transition-colors">
                <Users size={22} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#18191c] mb-2">Smart candidate matching</h3>
                <p className="text-sm text-[#5e6670] leading-relaxed">
                  Ranks applicants against a role&apos;s real requirements — skills, experience, and fit — instead of keyword luck.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="bg-white border border-[#e4e5e8] rounded-xl p-6 sm:p-7 flex flex-col justify-between hover:border-[#0a65cc] hover:shadow-md transition-all group">
              <div className="w-12 h-12 rounded-lg bg-[#e7f0fa] text-[#0a65cc] flex items-center justify-center mb-5 group-hover:bg-[#0a65cc] group-hover:text-white transition-colors">
                <Search size={22} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#18191c] mb-2">AI resume screening</h3>
                <p className="text-sm text-[#5e6670] leading-relaxed">
                  Reads and ranks thousands of resumes in seconds, saving weeks of manual filtering.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="bg-white border border-[#e4e5e8] rounded-xl p-6 sm:p-7 flex flex-col justify-between hover:border-[#0a65cc] hover:shadow-md transition-all group">
              <div className="w-12 h-12 rounded-lg bg-[#e7f0fa] text-[#0a65cc] flex items-center justify-center mb-5 group-hover:bg-[#0a65cc] group-hover:text-white transition-colors">
                <BarChart3 size={22} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#18191c] mb-2">Recruitment analytics</h3>
                <p className="text-sm text-[#5e6670] leading-relaxed">
                  Dashboards that track time-to-hire, source quality, and pipeline health in real time.
                </p>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="bg-white border border-[#e4e5e8] rounded-xl p-6 sm:p-7 flex flex-col justify-between hover:border-[#0a65cc] hover:shadow-md transition-all group">
              <div className="w-12 h-12 rounded-lg bg-[#e7f0fa] text-[#0a65cc] flex items-center justify-center mb-5 group-hover:bg-[#0a65cc] group-hover:text-white transition-colors">
                <Compass size={22} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#18191c] mb-2">Job recommendation</h3>
                <p className="text-sm text-[#5e6670] leading-relaxed">
                  Surfaces openings each applicant is actually qualified for and likely to succeed in.
                </p>
              </div>
            </div>

            {/* Feature 5 */}
            <div className="bg-white border border-[#e4e5e8] rounded-xl p-6 sm:p-7 flex flex-col justify-between hover:border-[#0a65cc] hover:shadow-md transition-all group">
              <div className="w-12 h-12 rounded-lg bg-[#e7f0fa] text-[#0a65cc] flex items-center justify-center mb-5 group-hover:bg-[#0a65cc] group-hover:text-white transition-colors">
                <FileText size={22} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#18191c] mb-2">Resume builder</h3>
                <p className="text-sm text-[#5e6670] leading-relaxed">
                  Turns your work history into an ATS-friendly, professional resume in minutes.
                </p>
              </div>
            </div>

            {/* Feature 6 */}
            <div className="bg-white border border-[#e4e5e8] rounded-xl p-6 sm:p-7 flex flex-col justify-between hover:border-[#0a65cc] hover:shadow-md transition-all group">
              <div className="w-12 h-12 rounded-lg bg-[#e7f0fa] text-[#0a65cc] flex items-center justify-center mb-5 group-hover:bg-[#0a65cc] group-hover:text-white transition-colors">
                <MessageSquare size={22} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#18191c] mb-2">AI career assistant</h3>
                <p className="text-sm text-[#5e6670] leading-relaxed">
                  Interactive mock interview prep, profile feedback, and personalized career guidance on demand.
                </p>
              </div>
            </div>
          </div>

          {/* Tech Stack Chips */}
          <div className="mt-10 flex flex-wrap items-center gap-3">
            <span className="text-xs uppercase font-bold tracking-wider text-[#0a65cc]">
              Under the hood:
            </span>
            <div className="flex flex-wrap gap-2">
              {['Artificial Intelligence', 'Machine Learning', 'NLP', 'Semantic Search', 'Cloud Computing', 'Data Analytics'].map((chip) => (
                <span
                  key={chip}
                  className="text-xs font-medium px-3 py-1.5 rounded-full border border-[#e4e5e8] text-[#464d61] bg-white hover:border-[#0a65cc] hover:text-[#0a65cc] transition-colors"
                >
                  {chip}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Why Us Section */}
      <section id="why" className="py-20 lg:py-24 bg-white border-b border-[#e4e5e8]">
        <div className="w-[92%] max-w-[1240px] mx-auto">
          <div className="max-w-[640px] mb-8">
            <p className="text-xs uppercase font-bold tracking-wider text-[#0a65cc] mb-2.5">
              Why chakri.ai
            </p>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#18191c]">
              Built to move at hiring speed.
            </h2>
          </div>

          <div className="flex flex-wrap gap-2 mb-10">
            {['AI-NATIVE', 'ALWAYS ON', 'FULLY DIGITAL', 'HR TECH'].map((badge) => (
              <span
                key={badge}
                className="text-xs font-semibold px-3 py-1 rounded-full bg-[#e7f0fa] text-[#0a65cc] border border-[#cee0f5]"
              >
                {badge}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-[#f7f8f9] rounded-xl p-6 border border-[#e4e5e8] hover:bg-white hover:border-[#0a65cc] hover:shadow-md transition-all">
              <div className="w-10 h-10 rounded-lg bg-[#e7f0fa] text-[#0a65cc] flex items-center justify-center mb-4">
                <Zap size={20} />
              </div>
              <h3 className="text-base font-bold text-[#18191c] mb-1.5">Faster hiring</h3>
              <p className="text-sm text-[#5e6670]">Cuts weeks off the average time-to-hire with automated ranking.</p>
            </div>

            <div className="bg-[#f7f8f9] rounded-xl p-6 border border-[#e4e5e8] hover:bg-white hover:border-[#0a65cc] hover:shadow-md transition-all">
              <div className="w-10 h-10 rounded-lg bg-[#e7f0fa] text-[#0a65cc] flex items-center justify-center mb-4">
                <CheckCircle2 size={20} />
              </div>
              <h3 className="text-base font-bold text-[#18191c] mb-1.5">Better matches</h3>
              <p className="text-sm text-[#5e6670]">Recommends candidates on real skills and experience, not just keywords.</p>
            </div>

            <div className="bg-[#f7f8f9] rounded-xl p-6 border border-[#e4e5e8] hover:bg-white hover:border-[#0a65cc] hover:shadow-md transition-all">
              <div className="w-10 h-10 rounded-lg bg-[#e7f0fa] text-[#0a65cc] flex items-center justify-center mb-4">
                <BarChart3 size={20} />
              </div>
              <h3 className="text-base font-bold text-[#18191c] mb-1.5">Data driven</h3>
              <p className="text-sm text-[#5e6670]">Every hiring decision backed by clear analytics, not a hunch.</p>
            </div>

            <div className="bg-[#f7f8f9] rounded-xl p-6 border border-[#e4e5e8] hover:bg-white hover:border-[#0a65cc] hover:shadow-md transition-all">
              <div className="w-10 h-10 rounded-lg bg-[#e7f0fa] text-[#0a65cc] flex items-center justify-center mb-4">
                <ShieldCheck size={20} />
              </div>
              <h3 className="text-base font-bold text-[#18191c] mb-1.5">Secure by default</h3>
              <p className="text-sm text-[#5e6670]">Privacy-focused architecture built to protect candidate data.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Founders Section */}
      <section id="team" className="py-20 lg:py-24 bg-[#f7f8f9]">
        <div className="w-[92%] max-w-[1240px] mx-auto">
          <div className="max-w-[640px] mb-10">
            <p className="text-xs uppercase font-bold tracking-wider text-[#0a65cc] mb-2.5">
              Leadership
            </p>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#18191c]">
              Leadership
            </h2>
          </div>

          <div className="max-w-[620px]">
            <div className="bg-white border border-[#e4e5e8] rounded-xl p-6 sm:p-7 flex items-start gap-5 hover:border-[#0a65cc] hover:shadow-md transition-all">
              <div className="w-14 h-14 rounded-full bg-[#e7f0fa] text-[#0a65cc] border border-[#cee0f5] flex items-center justify-center shrink-0 font-bold text-lg">
                AR
              </div>
              <div>
                <div className="font-bold text-lg text-[#18191c] mb-0.5">Amit Chandra Roy</div>
                <div className="text-xs font-semibold uppercase tracking-wider text-[#0a65cc] mb-2">
                  Founder &amp; CEO
                </div>
                <p className="text-sm text-[#5e6670]">Leads product design, commercial growth, and company strategy.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
