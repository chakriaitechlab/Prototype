'use client';

import { useEffect, useId, useState } from 'react';
import type { ReactNode } from 'react';
import { ArrowUpDown, Briefcase, Building2, Check, DollarSign, Search, SlidersHorizontal, X } from 'lucide-react';
import type { GovtJobFilters, GovtJobSort, GovtJobStatus, GovtOrganization, JobBadge, JobTab } from '@/types/jobs';
import { DEFAULT_GOVT_FILTERS, DEFAULT_PRIVATE_FILTERS, INDUSTRY_OPTIONS, JOB_TYPE_OPTIONS, SALARY_MAX, SALARY_MIN, SALARY_PRESETS, formatBdt, hasGovtFilters, hasPrivateFilters, jobTypeLabel, type Industry, type PrivateJobFilters } from '@/utils/job-filters';

const SALARY_STEP = 5_000;
const SALARY_DEFAULT_MIN = 30_000;
const SALARY_DEFAULT_MAX = 80_000;
const CUSTOM_PRESET = SALARY_PRESETS.length - 1;

const STATUS_OPTIONS: { label: string; value: GovtJobStatus }[] = [
  { label: 'Active Circulars', value: 'active' },
  { label: 'All Circulars', value: 'all' },
  { label: 'Expired Circulars', value: 'expired' },
];

const SORT_OPTIONS: { label: string; value: GovtJobSort }[] = [
  { label: 'Latest First', value: 'latest' },
  { label: 'Deadline Approaching', value: 'deadline' },
];

const TAB_TITLE: Record<JobTab, string> = { all: '(All Jobs)', private: '(Private Jobs)', govt: '(Govt Jobs)' };

type PrivateDraft = PrivateJobFilters & { salaryPreset: number };

function draftFrom(filters: PrivateJobFilters): PrivateDraft {
  return {
    ...filters,
    industries: [...filters.industries],
    jobTypes: [...filters.jobTypes],
    salaryMin: filters.salaryActive ? filters.salaryMin : SALARY_DEFAULT_MIN,
    salaryMax: filters.salaryActive ? filters.salaryMax : SALARY_DEFAULT_MAX,
    salaryPreset: CUSTOM_PRESET,
  };
}

function Chip({ label, onRemove, removeLabel }: { label: ReactNode; onRemove: () => void; removeLabel: string }) {
  return (
    <span className="jp-drawer-chip">
      {label}
      <button type="button" className="jp-drawer-chip-x" aria-label={removeLabel} onClick={onRemove}>
        <X size={11} strokeWidth={2.5} />
      </button>
    </span>
  );
}

function SectionTitle({ icon, children }: { icon?: ReactNode; children: ReactNode }) {
  return (
    <h3 className="jp-drawer-section-title">
      {icon}
      {children}
    </h3>
  );
}

type UnifiedJobFiltersDrawerProps = {
  open: boolean;
  onClose: () => void;
  jobTab: JobTab;
  searchQuery: string;
  location: string;
  organizations: GovtOrganization[];
  onClearSearch: () => void;
  onClearLocation: () => void;
  appliedPrivate: PrivateJobFilters;
  appliedGovt: GovtJobFilters;
  onApply: (privateFilters: PrivateJobFilters, govtFilters: GovtJobFilters) => void;
  onResetAll: () => void;
};

export function UnifiedJobFiltersDrawer({
  open,
  onClose,
  jobTab,
  searchQuery,
  location,
  organizations,
  onClearSearch,
  onClearLocation,
  appliedPrivate,
  appliedGovt,
  onApply,
  onResetAll,
}: UnifiedJobFiltersDrawerProps) {
  const titleId = useId();
  const [draftPrivate, setDraftPrivate] = useState(() => draftFrom(appliedPrivate));
  const [draftGovt, setDraftGovt] = useState(appliedGovt);
  const [orgSearch, setOrgSearch] = useState('');
  const [wasOpen, setWasOpen] = useState(open);

  // Start each opening from the applied filters
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setDraftPrivate(draftFrom(appliedPrivate));
      setDraftGovt(appliedGovt);
      setOrgSearch('');
    }
  }

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', closeOnEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [open, onClose]);

  if (!open) return null;

  const showGovt = jobTab !== 'private';
  const showPrivate = jobTab !== 'govt';
  const orgQuery = orgSearch.trim().toLowerCase();
  const filteredOrgs = organizations.filter(
    ({ name, nameBn }) => !orgQuery || name.toLowerCase().includes(orgQuery) || nameBn?.includes(orgQuery),
  );

  const toggleIndustry = (industry: Industry) =>
    setDraftPrivate((draft) => ({
      ...draft,
      industries: draft.industries.includes(industry)
        ? draft.industries.filter((item) => item !== industry)
        : [...draft.industries, industry],
    }));

  const toggleJobType = (type: JobBadge) =>
    setDraftPrivate((draft) => ({
      ...draft,
      jobTypes: draft.jobTypes.includes(type) ? draft.jobTypes.filter((item) => item !== type) : [...draft.jobTypes, type],
    }));

  const setSalaryMin = (value: number) =>
    setDraftPrivate((draft) => ({
      ...draft,
      salaryMin: Math.min(value, draft.salaryMax - SALARY_STEP),
      salaryActive: true,
      salaryPreset: CUSTOM_PRESET,
    }));

  const setSalaryMax = (value: number) =>
    setDraftPrivate((draft) => ({
      ...draft,
      salaryMax: Math.max(value, draft.salaryMin + SALARY_STEP),
      salaryActive: true,
      salaryPreset: CUSTOM_PRESET,
    }));

  const setSalaryPreset = (index: number) => {
    const { min, max } = SALARY_PRESETS[index];
    setDraftPrivate((draft) => ({
      ...draft,
      ...(min !== null && max !== null && { salaryMin: min, salaryMax: max }),
      salaryPreset: index,
      salaryActive: true,
    }));
  };

  const handleApply = () => {
    const { industries, jobTypes, salaryMin, salaryMax, salaryActive, remote } = draftPrivate;
    onApply({ industries, jobTypes, salaryMin, salaryMax, salaryActive, remote }, draftGovt);
    onClose();
  };

  const handleReset = () => {
    onResetAll();
    setDraftPrivate(draftFrom(DEFAULT_PRIVATE_FILTERS));
    setDraftGovt(DEFAULT_GOVT_FILTERS);
    onClose();
  };

  const hasActiveFilters = Boolean(
    searchQuery.trim() ||
      location.trim() ||
      (showPrivate && hasPrivateFilters(draftPrivate)) ||
      (showGovt && hasGovtFilters(draftGovt)),
  );

  const range = SALARY_MAX - SALARY_MIN;
  const minPct = ((draftPrivate.salaryMin - SALARY_MIN) / range) * 100;
  const maxPct = ((draftPrivate.salaryMax - SALARY_MIN) / range) * 100;

  return (
    <div className="jp-drawer" role="presentation">
      <button type="button" className="jp-drawer-backdrop" aria-label="Close filters" onClick={onClose} />
      <aside className="jp-drawer-panel" role="dialog" aria-modal="true" aria-labelledby={titleId}>
        <header className="jp-drawer-head">
          <h2 id={titleId}>Filters {TAB_TITLE[jobTab]}</h2>
          <div className="jp-drawer-head-actions">
            {hasActiveFilters && (
              <button type="button" className="jp-drawer-reset" onClick={handleReset}>
                Reset All
              </button>
            )}
            <button type="button" className="jp-drawer-close" aria-label="Close filters" onClick={onClose}>
              <X size={16} strokeWidth={2.25} />
            </button>
          </div>
        </header>

        <div className="jp-drawer-body">
          {hasActiveFilters && (
            <div className="jp-drawer-active">
              <p>Active Filters:</p>
              <div className="jp-drawer-chips">
                {searchQuery.trim() && (
                  <Chip label={`Search: ${searchQuery.trim()}`} removeLabel="Clear search" onRemove={onClearSearch} />
                )}
                {location.trim() && <Chip label={location.trim()} removeLabel="Clear location" onRemove={onClearLocation} />}

                {showGovt && draftGovt.status !== 'active' && (
                  <Chip
                    label={`Status: ${draftGovt.status === 'all' ? 'All' : 'Expired'}`}
                    removeLabel="Reset status"
                    onRemove={() => setDraftGovt((draft) => ({ ...draft, status: 'active' }))}
                  />
                )}
                {showGovt && draftGovt.organization && (
                  <Chip
                    label={draftGovt.organization}
                    removeLabel="Reset organization"
                    onRemove={() => setDraftGovt((draft) => ({ ...draft, organization: '' }))}
                  />
                )}
                {showGovt && draftGovt.sortBy !== 'latest' && (
                  <Chip
                    label="Deadline Approaching"
                    removeLabel="Reset sort"
                    onRemove={() => setDraftGovt((draft) => ({ ...draft, sortBy: 'latest' }))}
                  />
                )}

                {showPrivate &&
                  draftPrivate.industries.map((industry) => (
                    <Chip
                      key={industry}
                      label={industry}
                      removeLabel={`Remove ${industry}`}
                      onRemove={() => toggleIndustry(industry)}
                    />
                  ))}
                {showPrivate &&
                  draftPrivate.jobTypes.map((type) => (
                    <Chip
                      key={type}
                      label={jobTypeLabel(type)}
                      removeLabel={`Remove ${type}`}
                      onRemove={() => toggleJobType(type)}
                    />
                  ))}
                {showPrivate && draftPrivate.salaryActive && (
                  <Chip
                    label={`Salary: ${formatBdt(draftPrivate.salaryMin)} - ${formatBdt(draftPrivate.salaryMax)}`}
                    removeLabel="Reset salary"
                    onRemove={() =>
                      setDraftPrivate((draft) => ({
                        ...draft,
                        salaryActive: false,
                        salaryMin: SALARY_DEFAULT_MIN,
                        salaryMax: SALARY_DEFAULT_MAX,
                      }))
                    }
                  />
                )}
                {showPrivate && draftPrivate.remote && (
                  <Chip
                    label="Remote Only"
                    removeLabel="Remove remote"
                    onRemove={() => setDraftPrivate((draft) => ({ ...draft, remote: false }))}
                  />
                )}
              </div>
            </div>
          )}

          {showGovt && (
            <>
              <section className="jp-drawer-section">
                <SectionTitle icon={<SlidersHorizontal size={14} />}>Govt Circular Status</SectionTitle>
                <div className="jp-drawer-radios">
                  {STATUS_OPTIONS.map(({ label, value }) => (
                    <label key={value} className="jp-drawer-radio cursor-pointer">
                      <input
                        type="radio"
                        name="unified-status"
                        checked={draftGovt.status === value}
                        onChange={() => setDraftGovt((draft) => ({ ...draft, status: value }))}
                      />
                      <span className="jp-drawer-radio-mark" aria-hidden />
                      <span>{label}</span>
                    </label>
                  ))}
                </div>
              </section>

              <section className="jp-drawer-section">
                <SectionTitle icon={<Building2 size={14} />}>Government Organization</SectionTitle>

                <div className="jp-drawer-search">
                  <Search size={14} color="var(--jp-gray-400)" />
                  <input
                    type="text"
                    value={orgSearch}
                    onChange={(event) => setOrgSearch(event.target.value)}
                    placeholder="Search organization..."
                  />
                  {orgSearch && (
                    <button type="button" aria-label="Clear organization search" onClick={() => setOrgSearch('')}>
                      <X size={12} color="var(--jp-gray-400)" />
                    </button>
                  )}
                </div>

                <ul className="jp-drawer-industry jp-drawer-industry--orgs">
                  <li>
                    <button
                      type="button"
                      className={!draftGovt.organization ? 'is-active' : undefined}
                      onClick={() => setDraftGovt((draft) => ({ ...draft, organization: '' }))}
                    >
                      <span>All Organizations</span>
                      {!draftGovt.organization && <Check size={16} strokeWidth={2.5} aria-hidden />}
                    </button>
                  </li>
                  {filteredOrgs.map((org) => {
                    const active = draftGovt.organization === org.name;
                    return (
                      <li key={org.name}>
                        <button
                          type="button"
                          className={active ? 'is-active' : undefined}
                          aria-pressed={active}
                          onClick={() => setDraftGovt((draft) => ({ ...draft, organization: org.name }))}
                        >
                          <span className="jp-drawer-org-name">{org.nameBn || org.name}</span>
                          <span className="jp-drawer-org-count">{org.jobCount}</span>
                          {active && <Check size={16} strokeWidth={2.5} aria-hidden />}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </section>

              <section className="jp-drawer-section">
                <SectionTitle icon={<ArrowUpDown size={14} />}>Sort Circulars</SectionTitle>
                <div className="jp-drawer-radios">
                  {SORT_OPTIONS.map(({ label, value }) => (
                    <label key={value} className="jp-drawer-radio cursor-pointer">
                      <input
                        type="radio"
                        name="unified-sort"
                        checked={draftGovt.sortBy === value}
                        onChange={() => setDraftGovt((draft) => ({ ...draft, sortBy: value }))}
                      />
                      <span className="jp-drawer-radio-mark" aria-hidden />
                      <span>{label}</span>
                    </label>
                  ))}
                </div>
              </section>
            </>
          )}

          {showPrivate && (
            <>
              <section className="jp-drawer-section">
                <SectionTitle icon={<Briefcase size={14} />}>Industry / Category</SectionTitle>
                <ul className="jp-drawer-industry jp-drawer-industry--categories">
                  <li>
                    <button
                      type="button"
                      className={draftPrivate.industries.length === 0 ? 'is-active' : undefined}
                      onClick={() => setDraftPrivate((draft) => ({ ...draft, industries: [] }))}
                    >
                      <span>All Category</span>
                      {draftPrivate.industries.length === 0 && <Check size={16} strokeWidth={2.5} aria-hidden />}
                    </button>
                  </li>
                  {INDUSTRY_OPTIONS.map((industry) => {
                    const active = draftPrivate.industries.includes(industry);
                    return (
                      <li key={industry}>
                        <button
                          type="button"
                          className={active ? 'is-active' : undefined}
                          aria-pressed={active}
                          onClick={() => toggleIndustry(industry)}
                        >
                          <span>{industry}</span>
                          {active && <Check size={16} strokeWidth={2.5} aria-hidden />}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </section>

              <section className="jp-drawer-section">
                <SectionTitle>Job Type</SectionTitle>
                <div className="jp-drawer-radios">
                  {JOB_TYPE_OPTIONS.map(({ label, value }) => {
                    const checked = draftPrivate.jobTypes.includes(value);
                    return (
                      <label key={value} className="jp-drawer-radio cursor-pointer">
                        <input type="checkbox" checked={checked} onChange={() => toggleJobType(value)} />
                        <span className="jp-drawer-check-mark" aria-hidden>
                          {checked && <Check size={12} strokeWidth={3} />}
                        </span>
                        <span>{label}</span>
                      </label>
                    );
                  })}
                </div>
              </section>

              <section className="jp-drawer-section">
                <SectionTitle icon={<DollarSign size={14} />}>Salary Range</SectionTitle>
                <div className="jp-drawer-range">
                  <div className="jp-drawer-range-rail">
                    <div className="jp-drawer-range-track" aria-hidden>
                      <div
                        className="jp-drawer-range-fill"
                        style={{ left: `${minPct}%`, width: `${Math.max(0, maxPct - minPct)}%` }}
                      />
                    </div>
                    <span className="jp-drawer-range-thumb" style={{ left: `${minPct}%` }} aria-hidden />
                    <span className="jp-drawer-range-thumb" style={{ left: `${maxPct}%` }} aria-hidden />
                    <input
                      type="range"
                      min={SALARY_MIN}
                      max={SALARY_MAX}
                      step={SALARY_STEP}
                      value={draftPrivate.salaryMin}
                      onChange={(event) => setSalaryMin(Number(event.target.value))}
                      className={`jp-drawer-range-input jp-drawer-range-input--min${
                        draftPrivate.salaryMin > SALARY_MAX - draftPrivate.salaryMax ? ' is-front' : ''
                      }`}
                      aria-label="Minimum salary"
                    />
                    <input
                      type="range"
                      min={SALARY_MIN}
                      max={SALARY_MAX}
                      step={SALARY_STEP}
                      value={draftPrivate.salaryMax}
                      onChange={(event) => setSalaryMax(Number(event.target.value))}
                      className="jp-drawer-range-input jp-drawer-range-input--max"
                      aria-label="Maximum salary"
                    />
                  </div>
                  <div className="jp-drawer-range-labels">
                    <span>Min: {formatBdt(draftPrivate.salaryMin)}</span>
                    <span>Max: {formatBdt(draftPrivate.salaryMax)}</span>
                  </div>
                </div>

                <div className="jp-drawer-radios jp-drawer-radios--salary">
                  {SALARY_PRESETS.map((preset, index) => (
                    <label key={preset.label} className="jp-drawer-radio cursor-pointer">
                      <input
                        type="radio"
                        name="unified-salary-preset"
                        checked={draftPrivate.salaryActive && draftPrivate.salaryPreset === index}
                        onChange={() => setSalaryPreset(index)}
                      />
                      <span className="jp-drawer-radio-mark" aria-hidden />
                      <span>{preset.label}</span>
                    </label>
                  ))}
                </div>
              </section>

              <section className="jp-drawer-section">
                <label className="jp-drawer-radio jp-drawer-remote cursor-pointer">
                  <span className="jp-drawer-remote-label">Remote Jobs Only</span>
                  <input
                    type="checkbox"
                    checked={draftPrivate.remote}
                    onChange={(event) => setDraftPrivate((draft) => ({ ...draft, remote: event.target.checked }))}
                  />
                </label>
              </section>
            </>
          )}
        </div>

        <footer className="jp-drawer-foot">
          <button type="button" className="jp-btn jp-btn--primary jp-drawer-apply jp-drawer-apply--full" onClick={handleApply}>
            Apply Filters
          </button>
        </footer>
      </aside>
    </div>
  );
}
