export function CompanyMark({
  company,
  logoUrl,
  className = 'jp-job-logo',
  background = '#0a65cc',
}: {
  company: string;
  logoUrl?: string | null;
  className?: string;
  background?: string;
}) {
  if (logoUrl) {
    return (
      <div className={`${className} jp-company-mark--image overflow-hidden`} aria-hidden>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logoUrl} alt={company} className="w-full h-full object-contain" />
      </div>
    );
  }

  // Fallback brand mark with initial
  const initial = (company || 'C').slice(0, 2).toUpperCase();

  return (
    <div
      className={`${className} flex items-center justify-center font-bold text-white text-sm select-none rounded-lg`}
      style={{ background }}
      aria-hidden
    >
      {initial}
    </div>
  );
}
