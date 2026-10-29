'use client';

import { startTransition, useActionState, useRef, useState, useTransition } from 'react';
import type { ChangeEvent, DragEvent } from 'react';
import { ArrowRight, CheckCircle2, FileText, Loader2, Trash2, UploadCloud } from 'lucide-react';
import { continueOnboardingAction, skipCvAction, uploadCvAction } from '@/actions/onboarding.actions';
import { FormAlert } from '@/components/ui/FormAlert';
import type { ActionState } from '@/types/auth';

const ALLOWED_EXTENSIONS = ['.pdf', '.docx'];
const MAX_BYTES = 10 * 1024 * 1024;

function formatSize(bytes: number) {
  return bytes < 1024 * 1024 ? `${Math.round(bytes / 1024)} KB` : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function CvForm() {
  const [state, formAction, uploading] = useActionState(uploadCvAction, {});
  const [skipping, startSkip] = useTransition();
  const [continuing, startContinue] = useTransition();
  const [file, setFile] = useState<File | null>(null);
  const [clientError, setClientError] = useState<ActionState>({});
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isSaved = Boolean(state.message);
  const alert = clientError.error ? clientError : state;
  const isDocx = file?.name.toLowerCase().endsWith('.docx');

  const selectFile = (selected: File) => {
    setClientError({});
    if (!ALLOWED_EXTENSIONS.some((ext) => selected.name.toLowerCase().endsWith(ext))) {
      setClientError({ error: 'Only PDF or DOCX files are allowed.' });
      return;
    }
    if (selected.size > MAX_BYTES) {
      setClientError({ error: 'File must be 10 MB or smaller.' });
      return;
    }
    setFile(selected);
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0];
    if (selected) selectFile(selected);
  };

  const handleDrop = (event: DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
    const dropped = event.dataTransfer.files?.[0];
    if (dropped) selectFile(dropped);
  };

  const handleRemoveFile = () => {
    setFile(null);
    setClientError({});
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleUpload = () => {
    if (!file) return;
    const data = new FormData();
    data.set('file', file);
    startTransition(() => formAction(data));
  };

  const handleSkip = () => {
    startSkip(async () => {
      const result = await skipCvAction();
      if (result?.error) setClientError({ error: result.error });
    });
  };

  const handleContinue = () => {
    startContinue(async () => {
      const result = await continueOnboardingAction('cv');
      if (result?.error) setClientError({ error: result.error });
    });
  };

  const browse = () => fileInputRef.current?.click();

  return (
    <>
      <header className="jp-auth-heading">
        <h1>{isSaved ? 'Resume processed!' : 'Upload your resume'}</h1>
        <p className="jp-auth-subtitle">
          {isSaved
            ? 'Your resume has been saved. Next, review your career & skills!'
            : 'Upload your latest CV or resume, then fill in your details in the next step.'}
        </p>
      </header>

      <FormAlert message={alert.error} trigger={alert} />

      {!isSaved && (
        <>
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              setIsDragOver(false);
            }}
            onDrop={handleDrop}
            onClick={!file ? browse : undefined}
            role="button"
            tabIndex={0}
            aria-label="Upload your resume"
            onKeyDown={(e) => {
              if ((e.key === 'Enter' || e.key === ' ') && !file) {
                e.preventDefault();
                browse();
              }
            }}
            className={`jp-cv-dropzone${isDragOver ? ' is-dragover' : ''}${file ? ' has-file' : ''}`}
          >
            {!file ? (
              <>
                <div className="jp-cv-icon-box">
                  <UploadCloud size={28} aria-hidden />
                </div>
                <h3 className="jp-cv-title">Drag & drop your file here</h3>
                <p className="jp-cv-subtitle">or click to browse from your device</p>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    browse();
                  }}
                  className="jp-cv-browse-btn"
                >
                  <UploadCloud size={16} aria-hidden />
                  Browse Files
                </button>
                <p className="jp-cv-hint">PDF or DOCX — Max 10 MB</p>
              </>
            ) : (
              <div className="jp-cv-file-card" onClick={(e) => e.stopPropagation()}>
                <div className={`jp-cv-file-badge${isDocx ? ' is-docx' : ''}`}>
                  <FileText size={22} aria-hidden />
                </div>
                <div className="jp-cv-file-details">
                  <p className="jp-cv-file-title" title={file.name}>
                    {file.name}
                  </p>
                  <div className="jp-cv-file-meta">
                    <span>{formatSize(file.size)}</span>
                    <span>•</span>
                    <span className="jp-cv-file-ready-tag">
                      <CheckCircle2 size={13} aria-hidden />
                      Ready to process
                    </span>
                  </div>
                </div>
                {!uploading && (
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    aria-label="Remove selected file"
                    className="jp-cv-file-del-btn"
                    title="Remove file"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept={ALLOWED_EXTENSIONS.join(',')}
            className="sr-only"
            onChange={handleFileChange}
          />

          {file && (
            <div className="jp-cv-actions-row">
              <button type="button" className="jp-cv-regular-btn" onClick={handleUpload} disabled={uploading}>
                {uploading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" aria-hidden />
                    <span>Saving…</span>
                  </>
                ) : (
                  <>
                    <span>Fill Manually</span>
                    <ArrowRight size={15} aria-hidden />
                  </>
                )}
              </button>
            </div>
          )}

          {!uploading && (
            <>
              <div className="jp-cv-divider">
                <span>or</span>
              </div>

              <button type="button" className="jp-cv-skip-btn" onClick={handleSkip} disabled={skipping}>
                {skipping ? (
                  <>
                    <Loader2 size={16} className="animate-spin" aria-hidden />
                    <span>Skipping…</span>
                  </>
                ) : (
                  <>
                    <span>Skip for now</span>
                    <ArrowRight size={16} aria-hidden />
                  </>
                )}
              </button>
            </>
          )}
        </>
      )}

      {isSaved && (
        <div className="jp-cv-success-view">
          <div className="jp-cv-success-icon-wrap">
            <CheckCircle2 size={34} aria-hidden />
          </div>

          <h3 className="jp-cv-success-title">Resume Saved!</h3>
          <p className="jp-cv-success-sub">
            Your resume has been successfully added to your profile. Next, set your career preferences.
          </p>

          <button type="button" onClick={handleContinue} disabled={continuing} className="jp-btn jp-btn--primary jp-btn--block">
            <span>Continue to Career</span>
            <ArrowRight size={18} aria-hidden />
          </button>
        </div>
      )}
    </>
  );
}
