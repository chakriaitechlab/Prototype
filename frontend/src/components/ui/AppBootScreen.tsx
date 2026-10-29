import { AppLoader } from './AppLoader';

export function AppBootScreen({
  embedded = false,
  message = 'Loading',
  subMessage = 'Preparing your workspace',
}: {
  embedded?: boolean;
  message?: string;
  subMessage?: string;
}) {
  return (
    <div
      className={embedded ? 'app-load app-load--embedded' : 'app-load'}
      aria-busy="true"
      aria-live="polite"
      role="status"
      aria-label={message}
    >
      <div className="app-load-card">
        <AppLoader />
        <p className="app-load-text">{message}</p>
        {subMessage ? <p className="app-load-sub">{subMessage}</p> : null}
      </div>
    </div>
  );
}
