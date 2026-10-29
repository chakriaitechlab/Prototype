import { BarChart3 } from 'lucide-react';
import type { SkillScore } from '@/types/interviews';
import { scoreTone } from '@/utils/interviews';

export function SkillBreakdown({ skills }: { skills: SkillScore[] }) {
  return (
    <section className="border border-[#e4e5e8] bg-white">
      <h2 className="flex items-center gap-2 border-b border-[#e4e5e8] px-5 py-3.5 text-[15px] font-bold text-[#18191c]">
        <BarChart3 size={18} className="text-[#0a65cc]" aria-hidden />
        Skill breakdown
      </h2>
      <div className="grid gap-3.5 p-5">
        {skills.map((skill) => (
          <div key={skill.skillName} title={skill.summary}>
            <div className="mb-1.5 flex justify-between text-[13.5px]">
              <span>{skill.skillName}</span>
              <b>{skill.score}</b>
            </div>
            <div className="h-2 bg-[#f1f2f4]">
              <div className="h-full" style={{ width: `${skill.score}%`, background: scoreTone(skill.score) }} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
