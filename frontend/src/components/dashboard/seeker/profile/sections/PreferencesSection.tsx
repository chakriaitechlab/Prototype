'use client';

import type { JobPreferences, SalaryCurrency, WorkPreference } from '@/types/profile';
import { EMPLOYMENT_TYPE_OPTIONS, SALARY_CURRENCIES, WORK_PREFERENCE_OPTIONS } from '@/utils/profile';
import { TagInput } from '../TagInput';
import type { ProfileEditor } from '../use-profile-editor';

export function PreferencesSection({ editor }: { editor: ProfileEditor }) {
  const { draft, update } = editor;
  const prefs = draft.jobPreferences;
  const employmentTypes = prefs.employment_types ?? [];

  const setPrefs = (patch: Partial<JobPreferences>) => update('jobPreferences', { ...prefs, ...patch });

  return (
    <>
      <h3 className="cset-section-title">Career Preferences</h3>
      <div className="space-y-6">
        <div>
          <span className="cset-label">Preferred Job Roles</span>
          <TagInput
            tags={prefs.preferred_roles ?? []}
            placeholder="Type a role and press Enter (e.g. Full Stack Developer)"
            onChange={(preferred_roles) => setPrefs({ preferred_roles })}
          />
        </div>

        <div className="cset-fields-grid">
          <div>
            <label className="cset-label" htmlFor="prefs-work">Work Arrangement</label>
            <select
              id="prefs-work"
              className="cset-input cset-select"
              value={prefs.work_preference ?? 'any'}
              onChange={(e) => setPrefs({ work_preference: e.target.value as WorkPreference })}
            >
              {WORK_PREFERENCE_OPTIONS.map(({ value, label }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="cset-label" htmlFor="prefs-currency">Expected Salary Currency</label>
            <select
              id="prefs-currency"
              className="cset-input cset-select"
              value={prefs.expected_salary_currency ?? 'BDT'}
              onChange={(e) => setPrefs({ expected_salary_currency: e.target.value as SalaryCurrency })}
            >
              {SALARY_CURRENCIES.map((currency) => (
                <option key={currency} value={currency}>{currency}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="cset-label" htmlFor="prefs-min">Minimum Expected Salary</label>
            <input
              id="prefs-min"
              className="cset-input"
              type="number"
              min={0}
              value={prefs.expected_salary_min ?? 0}
              onChange={(e) => setPrefs({ expected_salary_min: Math.max(0, Math.trunc(Number(e.target.value))) })}
            />
          </div>

          <div>
            <label className="cset-label" htmlFor="prefs-max">Maximum Expected Salary</label>
            <input
              id="prefs-max"
              className="cset-input"
              type="number"
              min={0}
              value={prefs.expected_salary_max ?? 0}
              onChange={(e) => setPrefs({ expected_salary_max: Math.max(0, Math.trunc(Number(e.target.value))) })}
            />
          </div>
        </div>

        <div>
          <span className="cset-label">Employment Types</span>
          <div className="flex flex-wrap gap-2 mt-2">
            {EMPLOYMENT_TYPE_OPTIONS.map(({ value, label }) => {
              const checked = employmentTypes.includes(value);
              return (
                <label
                  key={value}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-[4px] text-[0.8125rem] font-medium border cursor-pointer ${
                    checked ? 'border-[#0a65cc] bg-[#e8eef6] text-[#0a65cc]' : 'border-[#e5e7eb] bg-white text-[#374151]'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() =>
                      setPrefs({
                        employment_types: checked
                          ? employmentTypes.filter((type) => type !== value)
                          : [...employmentTypes, value],
                      })
                    }
                    className="sr-only"
                  />
                  {label}
                </label>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
