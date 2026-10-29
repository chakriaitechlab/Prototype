import Link from 'next/link';
import { ArrowRight, Code2, Database, HeartPulse, LineChart, Megaphone, Music, PenTool, Video } from 'lucide-react';

const JP_CATEGORIES = [
  { title: 'Graphics & Design', icon: 'pen' as const, href: '/jobs?category=design' },
  { title: 'Code & Programming', icon: 'code' as const, href: '/jobs?category=software', highlight: true },
  { title: 'Digital Marketing', icon: 'megaphone' as const, href: '/jobs?category=marketing' },
  { title: 'Video & Animation', icon: 'video' as const, href: '/jobs?category=video' },
  { title: 'Music & Audio', icon: 'music' as const, href: '/jobs?category=audio' },
  { title: 'Account & Finance', icon: 'chart' as const, href: '/jobs?category=finance' },
  { title: 'Health & Care', icon: 'heart' as const, href: '/jobs?category=health' },
  { title: 'Data & Science', icon: 'database' as const, href: '/jobs?category=data' },
];

const CAT_ICONS = {
  pen: PenTool,
  code: Code2,
  megaphone: Megaphone,
  video: Video,
  music: Music,
  chart: LineChart,
  heart: HeartPulse,
  database: Database,
} as const;

export function PopularCategorySection() {
  return (
    <section className="jp-section">
      <div className="jp-container">
        <div className="jp-section-head">
          <h2 className="jp-section-title">Popular category</h2>
          <Link href="/jobs" className="jp-view-all">
            View All <ArrowRight size={16} />
          </Link>
        </div>
        <div className="jp-cat-grid">
          {JP_CATEGORIES.map((cat) => {
            const Icon = CAT_ICONS[cat.icon];
            return (
              <Link
                key={cat.title}
                href={cat.href}
                className={`jp-cat${cat.highlight ? ' is-highlight' : ''}`}
              >
                <div className="jp-cat-icon">
                  <Icon size={24} />
                </div>
                <div>
                  <h3>{cat.title}</h3>
                  <p>Browse openings</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
