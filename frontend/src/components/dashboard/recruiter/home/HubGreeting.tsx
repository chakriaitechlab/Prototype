import { requireDashboard } from '@/utils/session';
import { firstNameOf } from '@/utils/format';

export async function HubGreeting() {
  const { name } = await requireDashboard('RECRUITER');

  return <HubGreetingView name={firstNameOf(name, 'Recruiter')} />;
}

export function HubGreetingView({ name }: { name: string }) {
  return (
    <div className="cdash-greeting" data-purpose="greeting">
      <h1>Hello, {name}</h1>
      <p>Post roles and manage your hiring pipeline from one place</p>
    </div>
  );
}
