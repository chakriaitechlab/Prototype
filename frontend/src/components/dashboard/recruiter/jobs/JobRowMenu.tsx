'use client';

import { useEffect, useId, useRef, useState, useTransition } from 'react';
import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, MoreVertical, Pencil, Play, Trash2, XCircle } from 'lucide-react';
import { deleteJobAction, expireJobAction, resumeJobAction } from '@/actions/hire.actions';
import { FormAlert } from '@/components/ui/FormAlert';
import type { ActionState } from '@/types/auth';
import type { HireJob } from '@/types/hire';
import { editJobPath, jobDetailPath } from '@/utils/routes';
import { DeleteJobDialog } from './DeleteJobDialog';

const MENU_GAP = 6;
const VIEWPORT_MARGIN = 8;
const DROP_UP_THRESHOLD = 240;

type Alert = ActionState & { trigger: number };
type Anchor = { top?: number; bottom?: number; right: number; up: boolean };

type MenuItem = {
  label: string;
  icon: ReactNode;
  href?: string;
  onSelect?: () => void;
  danger?: boolean;
};

function anchorFor(trigger: HTMLElement): Anchor {
  const rect = trigger.getBoundingClientRect();
  const right = Math.max(VIEWPORT_MARGIN, window.innerWidth - rect.right);
  const up = window.innerHeight - rect.bottom < DROP_UP_THRESHOLD;
  return up
    ? { bottom: window.innerHeight - rect.top + MENU_GAP, right, up }
    : { top: rect.bottom + MENU_GAP, right, up };
}

export function JobRowMenu({ job }: { job: Pick<HireJob, 'id' | 'title' | 'status'> }) {
  const router = useRouter();
  const menuId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [anchor, setAnchor] = useState<Anchor | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [alert, setAlert] = useState<Alert | null>(null);

  const open = anchor !== null;
  const close = () => setAnchor(null);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!triggerRef.current?.contains(target) && !menuRef.current?.contains(target)) setAnchor(null);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setAnchor(null);
    };
    const onScrollOrResize = () => setAnchor(null);

    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    window.addEventListener('scroll', onScrollOrResize, { capture: true, passive: true });
    window.addEventListener('resize', onScrollOrResize);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('scroll', onScrollOrResize, { capture: true });
      window.removeEventListener('resize', onScrollOrResize);
    };
  }, [open]);

  const toggle = () => {
    if (open || !triggerRef.current) close();
    else setAnchor(anchorFor(triggerRef.current));
  };

  const run = (action: (jobId: string) => Promise<ActionState>, onDone?: () => void) => {
    startTransition(async () => {
      const result = await action(job.id);
      onDone?.();
      setAlert({ ...result, trigger: Date.now() });
      if (!result.error) router.refresh();
    });
  };

  const expired = job.status === 'CLOSED' || job.status === 'PAUSED';

  const items: MenuItem[] = [
    { label: 'View Details', icon: <Eye size={16} />, href: jobDetailPath(job.id) },
    { label: 'Edit Job', icon: <Pencil size={16} />, href: editJobPath(job.id) },
    ...(job.status === 'PAUSED'
      ? [{ label: 'Resume Job', icon: <Play size={16} />, onSelect: () => run(resumeJobAction) }]
      : []),
    ...(!expired && job.status !== 'DRAFT'
      ? [{ label: 'Make it Expire', icon: <XCircle size={16} />, danger: true, onSelect: () => run(expireJobAction) }]
      : []),
    { label: 'Delete', icon: <Trash2 size={16} />, danger: true, onSelect: () => setConfirmDelete(true) },
  ];

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className="cdash-kebab-btn"
        aria-label={`More actions for ${job.title || 'job'}`}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        disabled={isPending}
        onClick={toggle}
      >
        <MoreVertical size={18} aria-hidden />
      </button>

      {anchor &&
        createPortal(
          <div
            ref={menuRef}
            id={menuId}
            role="menu"
            className={`cdash-menu${anchor.up ? ' is-up' : ''}`}
            style={{ top: anchor.top, bottom: anchor.bottom, right: anchor.right }}
          >
            {items.map((item) => {
              const className = `cdash-menu-item${item.danger ? ' is-danger' : ''}`;
              return item.href ? (
                <Link key={item.label} href={item.href} role="menuitem" className={className} onClick={close}>
                  {item.icon}
                  {item.label}
                </Link>
              ) : (
                <button
                  key={item.label}
                  type="button"
                  role="menuitem"
                  className={className}
                  onClick={() => {
                    close();
                    item.onSelect?.();
                  }}
                >
                  {item.icon}
                  {item.label}
                </button>
              );
            })}
          </div>,
          document.body,
        )}

      <DeleteJobDialog
        open={confirmDelete}
        jobTitle={job.title}
        deleting={isPending}
        onClose={() => setConfirmDelete(false)}
        onConfirm={() => run(deleteJobAction, () => setConfirmDelete(false))}
      />

      <FormAlert
        message={alert?.error ?? alert?.message}
        type={alert?.error ? 'error' : 'success'}
        trigger={alert?.trigger}
      />
    </>
  );
}
