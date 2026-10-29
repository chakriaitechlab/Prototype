import { Building2, Calendar, Link2, MapPin } from 'lucide-react';
import type { CompanyTab } from '@/types/company';
import { COMPANY_TABS } from '@/utils/company-profile';

const TAB_ICONS: Record<CompanyTab, typeof Building2> = {
  info: Building2,
  founding: Calendar,
  social: Link2,
  contact: MapPin,
};

export function CompanyProfileTabs({ active, onChange }: { active: CompanyTab; onChange: (tab: CompanyTab) => void }) {
  return (
    <div className="cset-tabs no-scrollbar !mb-0 flex !flex-nowrap !gap-8 overflow-x-auto !border-b-0" role="tablist">
      {COMPANY_TABS.map(({ id, label }) => {
        const Icon = TAB_ICONS[id];
        const isActive = active === id;
        return (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={isActive}
            className={`cset-tab whitespace-nowrap${isActive ? ' is-active' : ''}`}
            onClick={() => onChange(id)}
          >
            <Icon className="cset-tab-ico" aria-hidden />
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );
}
