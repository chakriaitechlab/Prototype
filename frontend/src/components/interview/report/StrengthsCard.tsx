import { Target, ThumbsUp } from 'lucide-react';

export function StrengthsCard({ tone, items }: { tone: 'good' | 'improve'; items: string[] }) {
  const good = tone === 'good';
  const Icon = good ? ThumbsUp : Target;

  return (
    <section className="border border-[#e4e5e8] bg-white">
      <h2 className="flex items-center gap-2 border-b border-[#e4e5e8] px-5 py-3.5 text-[15px] font-bold text-[#18191c]">
        <Icon size={18} className={good ? 'text-[#28a745]' : 'text-[#d97706]'} aria-hidden />
        {good ? 'Strengths' : 'Areas to improve'}
      </h2>
      {items.length ? (
        <ul className="list-disc px-5 py-4 pl-9">
          {items.map((item) => (
            <li key={item} className="mb-2 text-[13.5px] leading-relaxed text-[#5e6670] last:mb-0">
              {item}
            </li>
          ))}
        </ul>
      ) : (
        <p className="px-5 py-4 text-[13.5px] text-[#767f8c]">Nothing specific was noted.</p>
      )}
    </section>
  );
}
