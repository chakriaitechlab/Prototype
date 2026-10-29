import type { ReactNode } from 'react';
import { CheckCircle2 } from 'lucide-react';

export function GovtJobSection({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="mb-10 scroll-mt-[calc(73px+6rem)]">
      <h2 className="mb-4 border-b-2 border-[#f1f5f9] pb-2.5 text-xl font-bold text-[#0f172a]">{title}</h2>
      {children}
    </section>
  );
}

type GovtJobListSectionProps = {
  id: string;
  title: string;
  items: string[];
  variant?: 'bullets' | 'checks';
};

export function GovtJobListSection({ id, title, items, variant = 'bullets' }: GovtJobListSectionProps) {
  return (
    <GovtJobSection id={id} title={title}>
      {variant === 'checks' ? (
        <div className="flex flex-col gap-3.5">
          {items.map((item) => (
            <div key={item} className="flex items-start gap-3 text-[0.95rem] leading-relaxed text-[#334155]">
              <CheckCircle2 size={18} className="mt-1 shrink-0 text-[#16a34a]" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      ) : (
        <ul className="m-0 flex list-disc flex-col gap-3 pl-5 text-[0.95rem] leading-[1.8] text-[#334155]">
          {items.map((item) => (
            <li key={item} className="pl-1">
              {item}
            </li>
          ))}
        </ul>
      )}
    </GovtJobSection>
  );
}
