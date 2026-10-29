import { GreetingView } from './Greeting';
import { MetricGrid } from './MetricCards';

export function GreetingSkeleton() {
  return <GreetingView name="…" />;
}

export function MetricCardsSkeleton() {
  return <MetricGrid applied="—" favorite="—" alerts="—" />;
}

export function ProfileAlertSkeleton() {
  return <div className="cdash-profile-alert cdash-profile-alert--loading" aria-busy="true" />;
}

export function TableSkeleton() {
  return <div className="cdash-empty">Loading applications…</div>;
}
