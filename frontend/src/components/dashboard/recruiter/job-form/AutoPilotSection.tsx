'use client';

import { Sparkles } from 'lucide-react';
import type { AutoPilotMode } from '@/types/hire';
import { AUTO_PILOT_MODES, THRESHOLD_SLIDER, thresholdLabel } from '@/utils/job-posting';

interface AutoPilotSectionProps {
  mode: AutoPilotMode;
  threshold: number;
  onModeChange: (mode: AutoPilotMode) => void;
  onThresholdChange: (threshold: number) => void;
}

const clampPercent = (value: number) => Math.min(100, Math.max(0, value || 0));

export function AutoPilotSection({ mode, threshold, onModeChange, onThresholdChange }: AutoPilotSectionProps) {
  return (
    <div className="cpost-card cpost-card--ai">
      <div className="cpost-ap-head">
        <div className="cpost-ap-icon">
          <Sparkles size={20} aria-hidden />
        </div>
        <div>
          <div className="cpost-ap-heading">
            <h2>Auto-Pilot Hiring AI</h2>
            <span className="cpost-ap-badge">AI Automated</span>
          </div>
          <p>
            Set your candidate criteria once. AI automatically scores resumes, invites qualified candidates to AI
            Interviews, and drafts evaluation summaries.
          </p>
        </div>
      </div>

      <div>
        <span className="cset-label cpost-ap-label">Select Auto-Pilot Mode</span>
        <div className="cpost-ap-modes" role="radiogroup" aria-label="Auto-Pilot mode">
          {AUTO_PILOT_MODES.map((option) => {
            const selected = mode === option.id;
            return (
              <button
                key={option.id}
                type="button"
                role="radio"
                aria-checked={selected}
                className={`cpost-ap-mode${selected ? ' is-on' : ''}`}
                onClick={() => onModeChange(option.id)}
              >
                <span className="cpost-ap-mode-top">
                  <strong>{option.label}</strong>
                  <span className="cpost-ap-mode-tag">{option.tag}</span>
                </span>
                <span className="cpost-ap-mode-desc">{option.description}</span>
              </button>
            );
          })}
        </div>
      </div>

      {mode === 'threshold' && (
        <div className="cpost-ap-threshold">
          <div className="cpost-ap-threshold-top">
            <div>
              <span className="cpost-ap-threshold-label">Minimum Match Score Cutoff: </span>
              <span className="cpost-ap-threshold-value">{threshold}%</span>
            </div>
            <span className="cpost-ap-badge cpost-ap-badge--soft">{thresholdLabel(threshold)}</span>
          </div>

          <div className="cpost-ap-threshold-inputs">
            <input
              type="range"
              className="cpost-ap-range"
              aria-label="Minimum match score cutoff"
              min={THRESHOLD_SLIDER.min}
              max={THRESHOLD_SLIDER.max}
              step={THRESHOLD_SLIDER.step}
              value={threshold}
              onChange={(e) => onThresholdChange(Number(e.target.value))}
            />
            <div className="cpost-ap-number">
              <input
                type="number"
                aria-label="Minimum match score cutoff percent"
                min={0}
                max={100}
                value={threshold}
                onChange={(e) => onThresholdChange(clampPercent(Number(e.target.value)))}
              />
              <span>%</span>
            </div>
          </div>

          <div className="cpost-ap-note">
            <strong>💡 How this works:</strong> Candidates scoring <strong>≥ {threshold}%</strong> automatically receive
            an email invitation to take their AI Video/Technical Interview. Candidates scoring below{' '}
            <strong>{threshold}%</strong> are routed to your <strong>Talent Pool</strong> with an AI rationale note (no
            applicant is permanently rejected by AI).
          </div>
        </div>
      )}
    </div>
  );
}
