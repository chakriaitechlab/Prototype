'use client';

import { useCallback, useState, useTransition } from 'react';
import type { FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Check, Loader2 } from 'lucide-react';
import { postJobAction, updateJobAction } from '@/actions/hire.actions';
import { FormAlert } from '@/components/ui/FormAlert';
import type { ApplyMethod, HireJobCreate, HireJobCreated } from '@/types/hire';
import {
  APPLY_METHODS,
  COUNTRIES,
  DIVISIONS,
  EDUCATION_LEVELS,
  EXPERIENCE_LEVELS,
  initialJobDraft,
  INTERVIEW_DIFFICULTIES,
  JOB_BENEFITS,
  JOB_LEVELS,
  JOB_TYPES,
  SALARY_CURRENCIES,
  SALARY_MODES,
  SALARY_TYPES,
} from '@/utils/job-posting';
import { RECRUITER_MY_POSTS_PATH } from '@/utils/routes';
import { AutoPilotSection } from './AutoPilotSection';
import { DescriptionEditor } from './DescriptionEditor';
import { PostSuccessModal } from './PostSuccessModal';

type FormState = { error?: string; message?: string };

interface JobFormProps {
  jobId?: string;
  initial?: HireJobCreate;
}

const toggle = <T,>(list: T[], item: T) => (list.includes(item) ? list.filter((v) => v !== item) : [...list, item]);

export function JobForm({ jobId, initial }: JobFormProps) {
  const router = useRouter();
  const [job, setJob] = useState<HireJobCreate>(() => initial ?? initialJobDraft());
  const [state, setState] = useState<FormState>({});
  const [posted, setPosted] = useState<HireJobCreated | null>(null);
  const [pending, startTransition] = useTransition();

  const set = <K extends keyof HireJobCreate>(key: K, value: HireJobCreate[K]) =>
    setJob((prev) => ({ ...prev, [key]: value }));

  const toggleApplyMethod = (method: ApplyMethod) => {
    if (job.applyMethods.length === 1 && job.applyMethods[0] === method) {
      setState({ error: 'Select at least one apply method.' });
      return;
    }
    set('applyMethods', toggle(job.applyMethods, method));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!job.title.trim() || !job.description.trim()) {
      setState({ error: 'Job title and description are required.' });
      return;
    }

    startTransition(async () => {
      const result = jobId ? await updateJobAction(jobId, job) : await postJobAction(job);
      if (!result.job) {
        setState({ error: result.error });
        return;
      }
      if (jobId) {
        setState({ message: 'Job updated' });
        router.refresh();
      } else {
        setPosted(result.job);
      }
    });
  };

  const closeModal = useCallback(() => router.push(RECRUITER_MY_POSTS_PATH), [router]);

  const isRange = job.salaryMode === 'range';

  return (
    <>
      <FormAlert message={state.error ?? state.message} type={state.error ? 'error' : 'success'} trigger={state} />

      <form className="cpost-form" onSubmit={handleSubmit} noValidate>
        <div className="cpost-layout">
          <div className="cpost-col">
            <div className="cpost-card">
              <h2 className="cpost-card-title">Job Information</h2>

              <div>
                <label className="cset-label" htmlFor="cpost-title">
                  Job Title <span className="text-red-500">*</span>
                </label>
                <input
                  id="cpost-title"
                  className="cset-input"
                  required
                  maxLength={200}
                  placeholder="e.g. Senior Software Engineer, Product Designer"
                  value={job.title}
                  onChange={(e) => set('title', e.target.value)}
                />
              </div>

              <div className="cpost-grid-2">
                <div>
                  <label className="cset-label" htmlFor="cpost-role">
                    Job Role
                  </label>
                  <input
                    id="cpost-role"
                    className="cset-input"
                    maxLength={100}
                    placeholder="e.g. Frontend Developer"
                    value={job.jobRole}
                    onChange={(e) => set('jobRole', e.target.value)}
                  />
                </div>
                <div>
                  <label className="cset-label" htmlFor="cpost-tags">
                    Tags & Keywords
                  </label>
                  <input
                    id="cpost-tags"
                    className="cset-input"
                    placeholder="React, TypeScript, Next.js..."
                    value={job.tags}
                    onChange={(e) => set('tags', e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="cpost-card">
              <h2 className="cpost-card-title">
                Job Description <span className="text-red-500">*</span>
              </h2>
              <DescriptionEditor value={job.description} onChange={(next) => set('description', next)} />
            </div>

            <div className="cpost-card">
              <h2 className="cpost-card-title">Job Benefits & Perks</h2>
              <div className="cpost-benefits">
                {JOB_BENEFITS.map((benefit) => {
                  const on = job.benefits.includes(benefit);
                  return (
                    <button
                      key={benefit}
                      type="button"
                      className={`cpost-benefit${on ? ' is-on' : ''}`}
                      aria-pressed={on}
                      onClick={() => set('benefits', toggle(job.benefits, benefit))}
                    >
                      {benefit}
                    </button>
                  );
                })}
              </div>
            </div>

            <AutoPilotSection
              mode={job.autoPilotMode}
              threshold={job.interviewThreshold}
              onModeChange={(mode) => set('autoPilotMode', mode)}
              onThresholdChange={(threshold) => set('interviewThreshold', threshold)}
            />
          </div>

          <div className="cpost-col">
            <div className="cpost-card">
              <h2 className="cpost-card-title">Salary & Compensation</h2>
              <div className="cpost-apply-list cpost-apply-list--2" role="radiogroup" aria-label="Salary type">
                {SALARY_MODES.map((mode) => (
                  <label key={mode.id} className={`cpost-apply${job.salaryMode === mode.id ? ' is-on' : ''}`}>
                    <input
                      type="radio"
                      name="salary-mode"
                      checked={job.salaryMode === mode.id}
                      onChange={() => set('salaryMode', mode.id)}
                    />
                    <span className="cpost-apply-radio" aria-hidden />
                    <span className="cpost-apply-copy">
                      <strong>{mode.name}</strong>
                      <span>{mode.desc}</span>
                    </span>
                  </label>
                ))}
              </div>

              {isRange && (
                <>
                  <div className="cpost-grid-2">
                    <div>
                      <label className="cset-label" htmlFor="cpost-min">
                        Min Salary
                      </label>
                      <div className="cset-input-wrap">
                        <input
                          id="cpost-min"
                          className="cset-input cpost-input--suffix"
                          type="number"
                          min={0}
                          placeholder="Minimum..."
                          value={job.salaryMin}
                          onChange={(e) => set('salaryMin', e.target.value)}
                        />
                        <span className="cpost-suffix">{job.salaryCurrency}</span>
                      </div>
                    </div>
                    <div>
                      <label className="cset-label" htmlFor="cpost-max">
                        Max Salary
                      </label>
                      <div className="cset-input-wrap">
                        <input
                          id="cpost-max"
                          className="cset-input cpost-input--suffix"
                          type="number"
                          min={0}
                          placeholder="Maximum..."
                          value={job.salaryMax}
                          onChange={(e) => set('salaryMax', e.target.value)}
                        />
                        <span className="cpost-suffix">{job.salaryCurrency}</span>
                      </div>
                    </div>
                  </div>

                  <div className="cpost-grid-2">
                    <SelectField
                      id="cpost-currency"
                      label="Currency"
                      value={job.salaryCurrency}
                      options={SALARY_CURRENCIES}
                      onChange={(value) => set('salaryCurrency', value)}
                    />
                    <SelectField
                      id="cpost-salary-type"
                      label="Salary Type"
                      value={job.salaryType}
                      options={SALARY_TYPES}
                      onChange={(value) => set('salaryType', value)}
                    />
                  </div>
                </>
              )}
            </div>

            <div className="cpost-card">
              <h2 className="cpost-card-title">Role Specifications</h2>

              <div className="cpost-grid-2">
                <SelectField
                  id="cpost-type"
                  label="Job Type"
                  value={job.jobType}
                  options={JOB_TYPES}
                  onChange={(value) => set('jobType', value)}
                />
                <SelectField
                  id="cpost-level"
                  label="Job Level"
                  placeholder="Select level..."
                  value={job.jobLevel}
                  options={JOB_LEVELS}
                  onChange={(value) => set('jobLevel', value)}
                />
              </div>

              <div className="cpost-grid-2">
                <SelectField
                  id="cpost-edu"
                  label="Education"
                  placeholder="Select education..."
                  value={job.education}
                  options={EDUCATION_LEVELS}
                  onChange={(value) => set('education', value)}
                />
                <SelectField
                  id="cpost-exp"
                  label="Experience"
                  placeholder="Select experience..."
                  value={job.experience}
                  options={EXPERIENCE_LEVELS}
                  onChange={(value) => set('experience', value)}
                />
              </div>

              <div className="cpost-grid-2">
                <div>
                  <label className="cset-label" htmlFor="cpost-vacancies">
                    Vacancies
                  </label>
                  <input
                    id="cpost-vacancies"
                    className="cset-input"
                    type="number"
                    min={1}
                    max={99}
                    value={job.vacancies}
                    onChange={(e) => set('vacancies', Number(e.target.value))}
                  />
                </div>
                <div>
                  <label className="cset-label" htmlFor="cpost-expire">
                    Expiration Date
                  </label>
                  <input
                    id="cpost-expire"
                    className="cset-input"
                    type="date"
                    value={job.deadline}
                    onChange={(e) => set('deadline', e.target.value)}
                  />
                </div>
              </div>

              <SelectField
                id="cpost-interview"
                label="AI Interview Difficulty"
                value={job.interviewDifficulty}
                options={INTERVIEW_DIFFICULTIES}
                onChange={(value) => set('interviewDifficulty', value)}
              />
            </div>

            <div className="cpost-card">
              <h2 className="cpost-card-title">Location</h2>
              <div className="cpost-grid-2">
                <SelectField
                  id="cpost-country"
                  label="Country"
                  value={job.country}
                  options={COUNTRIES}
                  disabled={job.isRemote}
                  onChange={(value) => set('country', value)}
                />
                <SelectField
                  id="cpost-city"
                  label="City / Division"
                  value={job.city}
                  options={DIVISIONS}
                  disabled={job.isRemote}
                  onChange={(value) => set('city', value)}
                />
              </div>
              <label className="cpost-check">
                <input type="checkbox" checked={job.isRemote} onChange={(e) => set('isRemote', e.target.checked)} />
                Fully Remote Position — Worldwide
              </label>
            </div>

            <div className="cpost-card">
              <div className="cpost-card-head">
                <h2 className="cpost-card-title">Apply Method &amp; {jobId ? 'Save' : 'Publish'}</h2>
                <span>Select one or more</span>
              </div>
              <div className="cpost-apply-list--stacked" role="group" aria-label="Apply job on">
                {APPLY_METHODS.map((method) => {
                  const checked = job.applyMethods.includes(method.id);
                  return (
                    <label key={method.id} className={`cpost-apply${checked ? ' is-on' : ''}`}>
                      <input type="checkbox" checked={checked} onChange={() => toggleApplyMethod(method.id)} />
                      <span className={`cpost-apply-check${checked ? ' is-on' : ''}`} aria-hidden>
                        {checked && <Check size={12} strokeWidth={3} />}
                      </span>
                      <span className="cpost-apply-copy">
                        <strong>{method.name}</strong>
                        <span>{method.desc}</span>
                      </span>
                    </label>
                  );
                })}
              </div>

              <button type="submit" className="cpost-submit cpost-submit--block" disabled={pending}>
                {pending ? (
                  <>
                    <Loader2 size={16} className="animate-spin" aria-hidden /> {jobId ? 'Saving…' : 'Publishing…'}
                  </>
                ) : (
                  <>
                    {jobId ? 'Save Changes' : 'Post Job'} <ArrowRight size={18} strokeWidth={2.25} aria-hidden />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>

      {posted && <PostSuccessModal title={posted.title} onClose={closeModal} />}
    </>
  );
}

interface SelectFieldProps {
  id: string;
  label: string;
  value: string;
  options: string[];
  placeholder?: string;
  disabled?: boolean;
  onChange: (value: string) => void;
}

function SelectField({ id, label, value, options, placeholder, disabled, onChange }: SelectFieldProps) {
  return (
    <div>
      <label className="cset-label" htmlFor={id}>
        {label}
      </label>
      <select
        id={id}
        className={`cset-input cset-select${placeholder && !value ? ' is-placeholder' : ''}`}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}
