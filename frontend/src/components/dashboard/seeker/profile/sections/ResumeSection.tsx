'use client';

import { useRef, useState, useTransition } from 'react';
import { FileText, Loader2, Trash2, Upload } from 'lucide-react';
import { deleteResumeAction, uploadResumeAction } from '@/actions/profile.actions';
import type { ActionState } from '@/types/auth';
import { DeleteResumeModal } from '../DeleteResumeModal';
import type { ProfileEditor } from '../use-profile-editor';

const RESUME_ACCEPT = '.pdf,.doc,.docx';

interface ResumeSectionProps {
  editor: ProfileEditor;
  onNotify: (state: ActionState) => void;
}

export function ResumeSection({ editor, onNotify }: ResumeSectionProps) {
  const { cvUrl, setCvUrl } = editor;
  const fileRef = useRef<HTMLInputElement>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [uploading, startUpload] = useTransition();
  const [deleting, startDelete] = useTransition();

  const upload = (file: File | undefined) => {
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    startUpload(async () => {
      const result = await uploadResumeAction(formData);
      if (result.cvUrl) setCvUrl(result.cvUrl);
      onNotify(result);
    });
  };

  const remove = () =>
    startDelete(async () => {
      const result = await deleteResumeAction();
      if (!result.error) {
        setCvUrl(null);
        setConfirmOpen(false);
      }
      onNotify(result);
    });

  return (
    <>
      <h3 className="cset-section-title">Resume &amp; CV Document</h3>
      <input
        ref={fileRef}
        type="file"
        accept={RESUME_ACCEPT}
        className="hidden"
        onChange={(e) => {
          upload(e.target.files?.[0]);
          e.target.value = '';
        }}
      />

      <div className="space-y-6">
        {cvUrl && (
          <div className="flex items-center justify-between p-5 border border-[#e5e7eb] rounded-[4px] bg-[#fafafa]">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-[4px] bg-[#fee2e2] text-[#dc2626]">
                <FileText size={20} />
              </div>
              <div>
                <p className="m-0 text-sm font-semibold text-[var(--cdash-ink)]">Current Resume</p>
                <a
                  href={cvUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-medium text-[#0a65cc] hover:underline"
                >
                  View or download uploaded file
                </a>
              </div>
            </div>
            <button
              type="button"
              className="p-2 border border-[#fee2e2] rounded-[4px] bg-white text-[#ef4444] cursor-pointer"
              disabled={deleting}
              onClick={() => setConfirmOpen(true)}
              title="Remove resume"
              aria-label="Remove resume"
            >
              {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            </button>
          </div>
        )}

        <button type="button" onClick={() => fileRef.current?.click()} className="cset-btn-primary" disabled={uploading}>
          {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
          {cvUrl ? 'Replace Resume (PDF/DOC)' : 'Upload Resume (PDF/DOC)'}
        </button>
      </div>

      {confirmOpen && <DeleteResumeModal deleting={deleting} onConfirm={remove} onClose={() => setConfirmOpen(false)} />}
    </>
  );
}
