import Link from 'next/link';
import { ArrowRight, Bookmark, Clock, Loader2, MessageSquare } from 'lucide-react';
import { UserAvatar } from '@/components/ui/UserAvatar';
import type { FavoriteItem } from '@/types/favorites';
import { formatDate } from '@/utils/format';
import { candidateProfilePath, chatPath } from '@/utils/routes';
import { FavoriteMenu } from './FavoriteMenu';

interface FavoriteRowProps {
  item: FavoriteItem;
  removing: boolean;
  onRemove: () => void;
}

export function FavoriteRow({ item, removing, onRemove }: FavoriteRowProps) {
  const { candidateId, name, title, username, avatarUrl, createdAt } = item;
  const href = candidateProfilePath(username);
  const messageHref = chatPath('RECRUITER', username ?? candidateId);

  return (
    <article className="group flex flex-col justify-between gap-4 border border-[#e4e5e8] bg-white p-3 transition-all hover:border-[#0a65cc] hover:shadow-xs sm:flex-row sm:items-center sm:p-3.5">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <Link href={href} className="shrink-0" tabIndex={-1}>
          <UserAvatar
            src={avatarUrl}
            name={name}
            className="h-10 w-10 border border-[#e4e5e8] text-sm font-bold shadow-2xs"
            fallbackClassName="bg-gradient-to-br from-[#0a65cc] to-[#084f9e] text-white"
          />
        </Link>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Link href={href}>
              <h2 className="truncate text-sm font-bold text-[#18191c] transition-colors group-hover:text-[#0a65cc]">
                {name}
              </h2>
            </Link>
            <span className="inline-flex items-center border border-[#0a65cc]/25 bg-[#e7f0fa] px-2 py-0.5 text-[10.5px] font-semibold text-[#0a65cc]">
              Job seeker
            </span>
          </div>
          <div className="mt-0.5 flex flex-wrap items-center gap-3 text-xs text-[#5e6670]">
            <span className="max-w-xs truncate">{title}</span>
            <span className="flex items-center gap-1 text-[#9199a3]">
              <Clock size={11} aria-hidden />
              Saved {formatDate(createdAt)}
            </span>
          </div>
        </div>
      </div>

      <div className="flex shrink-0 items-center justify-end gap-2 border-t border-[#f1f2f4] pt-2 sm:border-t-0 sm:pt-0">
        <button
          type="button"
          onClick={onRemove}
          disabled={removing}
          className="border border-[#e4e5e8] p-1.5 text-[#0a65cc] transition-colors hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600"
          aria-label={`Remove ${name} from saved candidates`}
          title="Remove from saved"
        >
          {removing ? (
            <Loader2 size={15} className="animate-spin text-[#767f8c]" aria-hidden />
          ) : (
            <Bookmark size={15} fill="currentColor" aria-hidden />
          )}
        </button>
        <Link
          href={href}
          className="jp-btn jp-btn--primary h-8! border-[#0a65cc]! px-3.5! text-xs!"
        >
          <span>View Profile</span>
          <ArrowRight size={13} aria-hidden />
        </Link>
        <Link
          href={messageHref}
          className="flex h-8 w-8 items-center justify-center border border-[#e4e5e8] text-[#5e6670] transition-colors hover:border-[#0a65cc]/50 hover:bg-[#e7f0fa] hover:text-[#0a65cc]"
          title={`Message ${name}`}
          aria-label={`Message ${name}`}
        >
          <MessageSquare size={14} aria-hidden />
        </Link>
        <FavoriteMenu name={name} profileHref={href} messageHref={messageHref} onRemove={onRemove} />
      </div>
    </article>
  );
}
