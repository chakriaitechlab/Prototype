export function CreditsHeader({ title, description }: { title: string; description: string }) {
  return (
    <div className="cdash-hero">
      <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{title}</h1>
      <p className="text-sm text-slate-500 mt-1">{description}</p>
    </div>
  );
}
