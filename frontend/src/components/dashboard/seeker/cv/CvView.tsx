'use client';

import { useCallback, useMemo, useState, useSyncExternalStore, useTransition } from 'react';
import { createPortal } from 'react-dom';
import { Download, FileText, Loader2, Save } from 'lucide-react';
import { FormAlert } from '@/components/ui/FormAlert';
import { CvForm } from './CvForm';
import { CvPreview } from './CvPreview';
import { saveCvAction } from '@/actions/cv.actions';
import type { BuiltCvProfile, CvSkillEntry } from '@/types/cv';
import { emptyCvDraft, normalizeCvDraft, skillEntriesFromDraft, syncSkillEntries } from '@/utils/cv';

interface CvViewProps {
  initialProfile?: BuiltCvProfile | null;
}

const subscribe = () => () => {};

export function CvView({ initialProfile }: CvViewProps) {
  const [prevInitial, setPrevInitial] = useState(initialProfile);
  const [savedDraft, setSavedDraft] = useState<BuiltCvProfile>(() =>
    emptyCvDraft(initialProfile ?? undefined),
  );
  const [draft, setDraft] = useState<BuiltCvProfile>(savedDraft);

  if (prevInitial !== initialProfile) {
    setPrevInitial(initialProfile);
    const next = emptyCvDraft(initialProfile ?? undefined);
    setSavedDraft(next);
    setDraft(next);
  }

  const isDirty = useMemo(() => {
    return JSON.stringify(draft) !== JSON.stringify(savedDraft);
  }, [draft, savedDraft]);

  const mounted = useSyncExternalStore(subscribe, () => true, () => false);
  const [isPending, startTransition] = useTransition();
  const [alert, setAlert] = useState<{ message: string; type: 'error' | 'success'; trigger: number } | null>(null);

  const patch = useCallback((partial: Partial<BuiltCvProfile>) => {
    setDraft((prev) => ({ ...prev, ...partial }));
  }, []);

  const skillEntries = skillEntriesFromDraft(draft);

  const patchSkillEntries = useCallback(
    (entries: CvSkillEntry[]) => {
      patch(syncSkillEntries(entries));
    },
    [patch],
  );

  const handleSave = () => {
    if (!isDirty) return;

    const normalized = normalizeCvDraft(draft);
    if (!normalized.fullName?.trim()) {
      setAlert({
        message: 'Please enter your full name before saving your CV.',
        type: 'error',
        trigger: Date.now(),
      });
      return;
    }

    startTransition(async () => {
      const result = await saveCvAction(normalized);
      if (result.error) {
        setAlert({
          message: result.error,
          type: 'error',
          trigger: Date.now(),
        });
      } else if (result.message) {
        setSavedDraft(draft);
        setAlert({
          message: result.message,
          type: 'success',
          trigger: Date.now(),
        });
      }
    });
  };

  const handleDownloadPdf = () => {
    const normalized = normalizeCvDraft(draft);
    if (!normalized.fullName?.trim()) {
      setAlert({
        message: 'Please enter your full name before downloading your CV.',
        type: 'error',
        trigger: Date.now(),
      });
      return;
    }

    document.body.classList.add('cv-print-mode');
    const cleanup = () => {
      document.body.classList.remove('cv-print-mode');
      window.removeEventListener('afterprint', cleanup);
    };
    window.addEventListener('afterprint', cleanup);
    window.print();
    // Fallback if afterprint never fires in certain mobile browsers
    window.setTimeout(cleanup, 1500);
  };

  return (
    <div className="cv-gen">
      {alert && <FormAlert message={alert.message} type={alert.type} trigger={alert.trigger} />}

      {/* Top Header & Actions Bar */}
      <div className="cv-gen-head">
        <div className="cv-gen-head-copy">
          <div className="cv-gen-eyebrow">
            <FileText size={14} aria-hidden />
            <span>CV Generator</span>
          </div>
          <h1 className="cv-gen-title">Build your Chakri CV</h1>
          <p className="cv-gen-lead">
            Fill in each section below. Live preview updates in real-time — save and download as a printable PDF.
          </p>
        </div>

        <div className="cv-gen-head-actions">
          <button
            type="button"
            className="cset-btn-secondary"
            onClick={handleDownloadPdf}
            disabled={isPending}
          >
            <Download size={16} aria-hidden />
            <span>Download PDF</span>
          </button>
          <button
            type="button"
            className="cset-btn-primary"
            onClick={handleSave}
            disabled={!isDirty || isPending}
            title={!isDirty ? 'No changes to save' : 'Save CV'}
          >
            {isPending ? (
              <Loader2 size={16} className="animate-spin" aria-hidden />
            ) : (
              <Save size={16} aria-hidden />
            )}
            <span>{isPending ? 'Saving…' : 'Save CV'}</span>
          </button>
        </div>
      </div>

      {/* 2-Column Responsive Layout: Editor Form + Live Preview Sheet */}
      <div className="cv-gen-layout">
        <div className="cv-gen-form-col">
          <CvForm
            draft={draft}
            skillEntries={skillEntries}
            onPatch={patch}
            onPatchSkillEntries={patchSkillEntries}
          />
        </div>

        <aside className="cv-gen-preview-col" aria-label="CV live preview">
          <div className="cv-gen-preview-toolbar">
            <span>Live Preview</span>
            <span className="cv-gen-preview-hint">A4 Standard Format</span>
          </div>
          <div className="cv-gen-preview-sheet">
            <CvPreview profile={draft} />
          </div>
        </aside>
      </div>

      {/* Dedicated Clean Print Root Portaled into Body for Ctrl+P / window.print() */}
      {mounted &&
        createPortal(
          <div className="cv-gen-print-root" aria-hidden>
            <CvPreview profile={draft} />
          </div>,
          document.body,
        )}
    </div>
  );
}
