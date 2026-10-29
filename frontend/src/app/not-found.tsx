import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Home } from 'lucide-react';
import { GoBackButton } from '@/components/ui/GoBackButton';

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen min-h-[100dvh] w-full flex-col items-center justify-center overflow-hidden bg-white px-4 py-8 text-center sm:px-6">
      {/* Background Atmosphere */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute top-1/3 left-1/2 h-[340px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/10 blur-[90px]" />
        <div className="absolute right-1/4 bottom-1/4 h-[220px] w-[300px] rounded-full bg-sky-400/10 blur-[80px]" />
      </div>

      {/* Main Centered Content */}
      <main className="relative z-10 mx-auto flex w-full max-w-xl -translate-y-3 flex-col items-center sm:-translate-y-5">
        {/* Illustration */}
        <div className="relative mb-6 flex items-center justify-center">
          <div className="relative h-44 w-64 drop-shadow-md sm:h-52 sm:w-80">
            <Image
              src="/jobpilot/undraw_searching_pqji.svg"
              alt="Page not found"
              fill
              className="object-contain"
              priority
              unoptimized
            />
          </div>
        </div>

        {/* Heading & Subtext */}
        <h1 className="mb-3 max-w-lg text-balance text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl md:text-4xl">
          Looking for something that isn&apos;t here?
        </h1>
        <p className="mb-8 max-w-md text-sm leading-relaxed text-slate-600 sm:text-base">
          The job posting, company, or page you were seeking may have expired, moved, or never existed.
        </p>

        {/* Navigation Actions */}
        <div className="flex flex-wrap items-center justify-center gap-3.5">
          <Link
            href="/"
            className="inline-flex items-center h-12 min-w-[190px] cursor-pointer justify-center gap-2 rounded-lg bg-[#0a65cc] px-6 text-[15px] font-semibold text-white shadow-[0_4px_14px_rgba(10,101,204,0.25)] transition-all duration-200 hover:bg-[#084ea3] hover:shadow-[0_6px_20px_rgba(10,101,204,0.35)]"
          >
            <Home className="h-[17px] w-[17px]" />
            Back to Homepage
          </Link>

          <GoBackButton
            className="inline-flex items-center h-12 min-w-[190px] cursor-pointer justify-center gap-2 rounded-lg border border-[#d1d5db] bg-white px-6 text-[15px] font-medium text-[#0a65cc] shadow-xs transition-all duration-200 hover:border-[#0a65cc] hover:bg-[#e7f0fa] hover:text-[#084ea3]"
          >
            <ArrowLeft className="h-[17px] w-[17px]" />
            Previous Page
          </GoBackButton>
        </div>
      </main>
    </div>
  );
}
