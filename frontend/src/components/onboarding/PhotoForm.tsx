'use client';

import { startTransition, useActionState, useEffect, useRef, useState } from 'react';
import type { ChangeEvent, DragEvent, FormEvent } from 'react';
import { ArrowRight, Camera, Loader2, Trash2, Upload, User } from 'lucide-react';
import { savePhotoAction } from '@/actions/onboarding.actions';
import { FormAlert } from '@/components/ui/FormAlert';
import type { ActionState } from '@/types/auth';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_BYTES = 2 * 1024 * 1024;

export function PhotoForm({ existingAvatarUrl, name }: { existingAvatarUrl: string | null; name: string | null }) {
  const [state, formAction, pending] = useActionState(savePhotoAction, {});
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [clientError, setClientError] = useState<ActionState>({});
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const alert = clientError.error ? clientError : state;
  const previewSrc = avatarPreview ?? existingAvatarUrl;

  useEffect(() => () => {
    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
  }, [avatarPreview]);

  const processFile = (file: File) => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      setClientError({ error: 'Only JPG, JPEG, PNG or WEBP images are allowed.' });
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }
    if (file.size > MAX_BYTES) {
      setClientError({ error: 'Image must be 2 MB or smaller.' });
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setClientError({});
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (event: DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
    const file = event.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleRemove = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
    setClientError({});
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setClientError({});

    if (!avatarFile && !existingAvatarUrl) {
      setClientError({ error: 'Please upload a profile photo to continue.' });
      return;
    }

    const data = new FormData();
    if (avatarFile) data.set('file', avatarFile);
    startTransition(() => formAction(data));
  };

  const browse = () => fileInputRef.current?.click();

  return (
    <form onSubmit={handleSubmit} className="jp-auth-form">
      <FormAlert message={alert.error} trigger={alert} />
      <div className="jp-field">
        <label className="jp-photo-label">
          Profile photo {!existingAvatarUrl && <span className="jp-photo-req">*</span>}
        </label>

        <div
          className={`jp-photo-dropzone ${isDragOver ? 'is-dragover' : ''} ${alert.error ? 'is-error' : ''}`}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            setIsDragOver(false);
          }}
          onDrop={handleDrop}
        >
          <div className="jp-photo-avatar-wrap">
            <button type="button" className="jp-photo-avatar-btn" onClick={browse} aria-label="Upload profile picture">
              {previewSrc ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={previewSrc} alt={avatarPreview ? 'Preview' : name || 'Profile photo'} className="jp-photo-avatar-img" />
              ) : (
                <div className="jp-photo-avatar-empty">
                  <User size={36} className="jp-photo-empty-icon" aria-hidden />
                </div>
              )}
              <span className="jp-photo-camera-badge" title="Change photo">
                <Camera size={14} aria-hidden />
              </span>
            </button>
          </div>

          <div className="jp-photo-info">
            <h4 className="jp-photo-title">{previewSrc ? 'Photo ready' : 'Upload your photo'}</h4>
            <p className="jp-photo-desc">Drag and drop your picture here, or browse from your device.</p>
            <div className="jp-photo-actions">
              <button type="button" className="jp-photo-upload-btn" onClick={browse}>
                <Upload size={14} aria-hidden />
                <span>{previewSrc ? 'Change photo' : 'Browse file'}</span>
              </button>
              {avatarPreview && (
                <button type="button" className="jp-photo-remove-btn" onClick={handleRemove}>
                  <Trash2 size={14} aria-hidden />
                  <span>Remove</span>
                </button>
              )}
            </div>
            <p className="jp-photo-meta">JPG, JPEG, PNG or WEBP · max 2 MB</p>
          </div>

          <input ref={fileInputRef} type="file" accept=".jpg,.jpeg,.png" className="sr-only" onChange={handleChange} />
        </div>

      </div>

      <button type="submit" className="jp-btn jp-btn--primary jp-btn--block" disabled={pending}>
        {pending ? (
          <>
            <Loader2 className="jp-spinner" size={18} aria-hidden />
            <span>Saving…</span>
          </>
        ) : (
          <>
            <span>Next</span>
            <ArrowRight size={18} aria-hidden />
          </>
        )}
      </button>
    </form>
  );
}
