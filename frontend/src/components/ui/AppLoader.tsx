/** Shared corner-square loader used on loading screens. */
export function AppLoader({
  className = '',
  center = false,
}: {
  className?: string;
  center?: boolean;
}) {
  const loader = (
    <div className={`app-load-loader${className ? ` ${className}` : ''}`} aria-hidden="true" />
  );

  if (center) {
    return (
      <div className="flex min-h-[calc(100dvh-160px)] w-full flex-1 items-center justify-center p-6">
        {loader}
      </div>
    );
  }

  return loader;
}

/** Full-height centered page/dashboard loader */
export function PageLoader({ className = '' }: { className?: string }) {
  return (
    <div className={`flex min-h-[calc(100dvh-160px)] w-full flex-1 items-center justify-center ${className}`}>
      <AppLoader />
    </div>
  );
}
