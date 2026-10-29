'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Eye, MessageSquare, MoreHorizontal, Trash2 } from 'lucide-react';

const ITEM_CLASS =
  'flex w-full items-center gap-2 px-3 py-1.5 text-left text-[13px] font-medium text-slate-700 transition-colors hover:bg-slate-50';

interface FavoriteMenuProps {
  name: string;
  profileHref: string;
  messageHref: string;
  onRemove: () => void;
}

export function FavoriteMenu({ name, profileHref, messageHref, onRemove }: FavoriteMenuProps) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <div className="relative inline-block shrink-0">
      <button
        type="button"
        aria-label={`Actions for ${name}`}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="flex h-8 w-8 items-center justify-center border border-[#e4e5e8] text-slate-500 transition-colors hover:border-[#0a65cc] hover:bg-[#e7f0fa] hover:text-slate-700"
      >
        <MoreHorizontal size={15} aria-hidden />
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-hidden
            tabIndex={-1}
            className="fixed inset-0 z-10 cursor-default"
            onClick={close}
          />
          <div className="absolute right-0 z-20 mt-1 w-44 border border-[#e4e5e8] bg-white py-1 shadow-md">
            <Link href={profileHref} onClick={close} className={ITEM_CLASS}>
              <Eye size={15} aria-hidden />
              View Profile
            </Link>
            <Link href={messageHref} onClick={close} className={ITEM_CLASS}>
              <MessageSquare size={15} aria-hidden />
              Send Message
            </Link>
            <button
              type="button"
              onClick={() => {
                close();
                onRemove();
              }}
              className={`${ITEM_CLASS} !text-red-600 hover:!bg-red-50`}
            >
              <Trash2 size={15} aria-hidden />
              Remove from Saved
            </button>
          </div>
        </>
      )}
    </div>
  );
}
