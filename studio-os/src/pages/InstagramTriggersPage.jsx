import { Instagram } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export default function InstagramTriggersPage() {
  const { user } = useAuth();

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6">
      <header className="flex items-start gap-3">
        <Instagram size={20} className="text-burgundy-muted shrink-0 mt-1" />
        <div>
          <h1 className="text-xl font-semibold text-ink">Comment-to-DM</h1>
          <p className="text-xs text-subtle mt-1">
            Quando qualcuno commenta una keyword su un post o risponde a una storia, mando in automatico un DM con il link e (opzionale) rispondo pubblicamente al commento.
          </p>
        </div>
      </header>

      <SetupCard userId={user?.id} />
      <TriggersSection userId={user?.id} />
      <EventLog userId={user?.id} />
    </div>
  );
}

function SetupCard({ userId }) {
  return (
    <div className="glass rounded-lg p-5">
      <p className="label-meta mb-2">Setup Meta</p>
      <p className="text-sm text-muted">Da implementare in Task 4.</p>
    </div>
  );
}

function TriggersSection({ userId }) {
  return (
    <div className="glass rounded-lg p-5">
      <p className="label-meta mb-2">Trigger</p>
      <p className="text-sm text-muted">Da implementare in Task 5.</p>
    </div>
  );
}

function EventLog({ userId }) {
  return (
    <div className="glass rounded-lg p-5">
      <p className="label-meta mb-2">Eventi recenti</p>
      <p className="text-sm text-muted">Da implementare in Task 6.</p>
    </div>
  );
}
