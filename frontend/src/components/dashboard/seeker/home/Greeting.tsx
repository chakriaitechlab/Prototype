import { requireDashboard } from '@/utils/session';
import { firstNameOf } from '@/utils/format';

export async function Greeting() {
  const { name } = await requireDashboard('SEEKER');

  return <GreetingView name={firstNameOf(name, 'Seeker')} />;
}

export function GreetingView({ name }: { name: string }) {
  return (
    <div className="cdash-greeting" data-purpose="greeting">
      <h1>Hello, {name}</h1>
      <p>Here is your daily activities and job alerts</p>
    </div>
  );
}
