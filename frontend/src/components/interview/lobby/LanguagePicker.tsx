'use client';

import { Languages } from 'lucide-react';
import type { InterviewLanguage } from '@/types/interviews';
import { INTERVIEW_LANGUAGES } from '@/utils/interviews';

export function LanguagePicker({ value, onChange }: { value: InterviewLanguage; onChange: (language: InterviewLanguage) => void }) {
  return (
    <section className="border border-[#e4e5e8] bg-white">
      <h2 className="flex items-center gap-2 border-b border-[#e4e5e8] px-5 py-3.5 text-[15px] font-bold text-[#18191c]">
        <Languages size={18} className="text-[#0a65cc]" aria-hidden />
        Interview language
      </h2>
      <div className="grid grid-cols-2 gap-2.5 p-4" role="radiogroup" aria-label="Interview language">
        {INTERVIEW_LANGUAGES.map((language) => {
          const selected = language.id === value;
          return (
            <button
              key={language.id}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(language.id)}
              className={`cursor-pointer p-3 text-left transition ${selected ? 'border-2 border-[#0a65cc] bg-[#f5f9fe]' : 'border border-[#e4e5e8] bg-white hover:bg-[#f8fafc]'}`}
            >
              <span className="block text-[13.5px] font-bold text-[#18191c]">{language.title}</span>
              <span className="text-xs text-[#767f8c]">{language.subtitle}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
