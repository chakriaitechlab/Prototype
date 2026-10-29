import { CompanyMark } from '@/components/ui/CompanyMark';
import type { InterviewSession } from '@/types/interviews';

export function InterviewJobCard({ interview }: { interview: InterviewSession }) {
  const { job, skills } = interview;

  return (
    <div className="flex items-center gap-4 border border-[#e4e5e8] bg-white p-4 sm:p-5">
      <CompanyMark company={job.company.name} logoUrl={job.company.logoUrl} className="h-[60px] w-[60px] shrink-0 text-lg" />
      <div className="min-w-0">
        <p className="text-xl font-bold text-[#18191c]">{job.title}</p>
        <p className="mt-0.5 text-[13.5px] text-[#767f8c]">
          {[job.company.name, job.employmentType || 'Full Time', job.location || 'Remote'].join(' • ')}
        </p>
        {skills.length > 0 && (
          <div className="mt-2.5 flex flex-wrap gap-2">
            {skills.map((skill) => (
              <span key={skill} className="border border-[#e4e5e8] bg-[#f8fafc] px-2.5 py-1 text-[12.5px] font-medium text-[#5e6670]">
                {skill}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
