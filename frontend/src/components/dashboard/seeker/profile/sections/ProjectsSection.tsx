'use client';

import { useState, useTransition } from 'react';
import { Image as ImageIcon, Loader2, Trash2, Upload } from 'lucide-react';
import { uploadProjectPhotoAction } from '@/actions/profile.actions';
import type { ActionState } from '@/types/auth';
import { newId } from '@/utils/profile';
import { EmptyList, EntryCard, ListHeader } from '../EntryCard';
import type { ProfileEditor } from '../use-profile-editor';

const PHOTO_ACCEPT = 'image/jpeg,image/png,image/webp';
const PHOTO_MAX_BYTES = 5 * 1024 * 1024;

interface ProjectsSectionProps {
  editor: ProfileEditor;
  onNotify: (state: ActionState) => void;
}

function PhotoInput({ disabled, onFile }: { disabled: boolean; onFile: (file: File) => void }) {
  return (
    <input
      type="file"
      accept={PHOTO_ACCEPT}
      className="hidden"
      disabled={disabled}
      onChange={(e) => {
        const file = e.target.files?.[0];
        if (file) onFile(file);
        e.target.value = '';
      }}
    />
  );
}

export function ProjectsSection({ editor, onNotify }: ProjectsSectionProps) {
  const { draft, addItem, updateItem, removeItem } = editor;
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [, startUpload] = useTransition();

  const uploadPhoto = (index: number, projectId: string, file: File) => {
    if (!file.type.startsWith('image/')) return onNotify({ error: 'Please upload an image file (JPG, PNG, WebP)' });
    if (file.size > PHOTO_MAX_BYTES) return onNotify({ error: 'Image size must be under 5MB' });

    const formData = new FormData();
    formData.append('file', file);
    setUploadingId(projectId);
    startUpload(async () => {
      const result = await uploadProjectPhotoAction(formData);
      if (result.url) updateItem('projects', index, { image_url: result.url });
      setUploadingId(null);
      onNotify(result);
    });
  };

  return (
    <>
      <ListHeader
        title="Projects"
        addLabel="Add Project"
        onAdd={() => addItem('projects', { id: newId(), title: '', tags: [] })}
      />

      {draft.projects.length === 0 && <EmptyList>Add projects to showcase your portfolio, code, or live demos.</EmptyList>}

      <div className="space-y-4">
        {draft.projects.map((project, i) => {
          const uploading = uploadingId === project.id;
          const onFile = (file: File) => uploadPhoto(i, project.id, file);

          return (
            <EntryCard key={project.id} onRemove={() => removeItem('projects', i)}>
              <div className="space-y-3">
                <div>
                  <label className="cset-label" htmlFor={`project-title-${project.id}`}>Project Title</label>
                  <input
                    id={`project-title-${project.id}`}
                    className="cset-input"
                    value={project.title}
                    maxLength={120}
                    onChange={(e) => updateItem('projects', i, { title: e.target.value })}
                    placeholder="e.g. AI Resume Builder"
                  />
                </div>
                <div>
                  <label className="cset-label" htmlFor={`project-desc-${project.id}`}>Description</label>
                  <textarea
                    id={`project-desc-${project.id}`}
                    className="cset-input min-h-[80px]"
                    value={project.description ?? ''}
                    maxLength={2000}
                    onChange={(e) => updateItem('projects', i, { description: e.target.value })}
                    rows={2}
                    placeholder="Brief summary of the architecture and accomplishments…"
                  />
                </div>
                <div className="cset-fields-grid">
                  <div>
                    <label className="cset-label" htmlFor={`project-url-${project.id}`}>Live Demo URL</label>
                    <input
                      id={`project-url-${project.id}`}
                      className="cset-input"
                      value={project.url ?? ''}
                      maxLength={500}
                      onChange={(e) => updateItem('projects', i, { url: e.target.value })}
                      placeholder="https://myproject.com"
                    />
                  </div>
                  <div>
                    <label className="cset-label" htmlFor={`project-repo-${project.id}`}>Repository URL</label>
                    <input
                      id={`project-repo-${project.id}`}
                      className="cset-input"
                      value={project.repo_url ?? ''}
                      maxLength={500}
                      onChange={(e) => updateItem('projects', i, { repo_url: e.target.value })}
                      placeholder="https://github.com/user/project"
                    />
                  </div>
                </div>

                <div>
                  <span className="cset-label">Project Photo / Screenshot</span>
                  {project.image_url ? (
                    <div className="relative group w-full max-w-sm aspect-[16/9] rounded-[6px] overflow-hidden border border-[#dadbdd] bg-[#f7f8f9] shadow-2xs">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={project.image_url} alt={project.title || 'Project preview'} className="h-full w-full object-cover" />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <label className="px-3 py-1.5 rounded-[4px] bg-white text-[#222325] text-xs font-semibold hover:bg-[#f5f5f5] cursor-pointer shadow-xs inline-flex items-center gap-1.5 transition-colors">
                          {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                          <span>Change</span>
                          <PhotoInput disabled={uploading} onFile={onFile} />
                        </label>
                        <button
                          type="button"
                          onClick={() => updateItem('projects', i, { image_url: undefined })}
                          className="px-3 py-1.5 rounded-[4px] bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 cursor-pointer shadow-xs inline-flex items-center gap-1.5 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label
                      className={`w-full max-w-sm flex flex-col items-center justify-center p-4 border border-dashed rounded-[6px] transition-colors cursor-pointer ${
                        uploading
                          ? 'border-[#0a65cc] bg-[#f0f7ff]'
                          : 'border-[#dadbdd] hover:border-[#0a65cc] hover:bg-[#f7f8f9] bg-white'
                      }`}
                    >
                      <PhotoInput disabled={uploading} onFile={onFile} />
                      {uploading ? (
                        <div className="flex flex-col items-center gap-2 py-3">
                          <Loader2 className="w-6 h-6 animate-spin text-[#0a65cc]" />
                          <span className="text-xs text-[#0a65cc] font-medium">Uploading...</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center text-center gap-1 py-2">
                          <div className="p-2 rounded-full bg-[#f0f7ff] text-[#0a65cc] mb-0.5">
                            <ImageIcon className="w-5 h-5" />
                          </div>
                          <span className="text-xs font-semibold text-[#222325]">Upload Project Photo</span>
                          <span className="text-[11px] text-[#74767e]">JPG, PNG, WebP up to 5MB</span>
                        </div>
                      )}
                    </label>
                  )}
                </div>
              </div>
            </EntryCard>
          );
        })}
      </div>
    </>
  );
}
