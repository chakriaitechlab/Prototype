import Link from 'next/link';
import { ArrowRight, Plus } from 'lucide-react';
import { RECRUITER_POST_JOB_PATH } from '@/utils/routes';

export function PostJobButton() {
  return (
    <Link href={RECRUITER_POST_JOB_PATH} className="jp-btn jp-btn--primary h-[42px]! px-5! text-sm!">
      <Plus size={16} aria-hidden />
      <span>Post a job</span>
      <ArrowRight size={16} aria-hidden />
    </Link>
  );
}
