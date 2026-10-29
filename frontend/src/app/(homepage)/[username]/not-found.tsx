import Link from 'next/link';
import { UserX } from 'lucide-react';

export default function PortfolioNotFound() {
  return (
    <div className="max-w-xl mx-auto px-4 py-24 text-center">
      <UserX className="w-12 h-12 text-[#9199a3] mx-auto mb-4" />
      <h1 className="text-2xl font-bold text-[#222325]">Portfolio not found</h1>
      <p className="text-sm text-[#74767e] mt-2">
        This public portfolio could not be found or has not been published yet.
      </p>
      <Link
        href="/"
        className="inline-flex items-center justify-center mt-6 h-11 px-6 rounded-[6px] bg-[#0a65cc] hover:bg-[#084ea3] !text-white text-sm font-semibold transition-colors"
      >
        Back to home
      </Link>
    </div>
  );
}
