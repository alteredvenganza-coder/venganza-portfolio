import { useState, useEffect } from 'react';
import { Copy, Check, Loader2, UserPlus, Users, HardDrive, Gift } from 'lucide-react';
import Btn from '../components/Btn';
import { useAuth } from '../hooks/useAuth';
import { fetchInviteCodes, createInviteCode, fetchAllGuestProfiles } from '../lib/db';

function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export default function AdminInvitesPage() {
  const { user } = useAuth();
  const [invites, setInvites]   = useState([]);
  const [guests,  setGuests]    = useState([]);
  const [loading, setLoading]   = useState(true);
  const [creating, setCreating] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      fetchInviteCodes(user.id),
      fetchAllGuestProfiles(),
    ])
      .then(([inv, gst]) => { setInvites(inv); setGuests(gst); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  const handleCreate = async () => {
    setCreating(true);
    try {
      const newCode = await createInviteCode(user.id);
      setInvites(prev => [newCode, ...prev]);
    } catch (err) {
      alert('Errore: ' + err.message);
    } finally {
      setCreating(false);
    }
  };

  const copyInviteLink = (code, id) => {
    const link = `${window.location.origin}/signup?code=${code}`;
    navigator.clipboard.writeText(link);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Match guest profiles to invite codes
  const guestMap = {};
  guests.forEach(g => { guestMap[g.id] = g; });

  // Total storage used by guests
  const totalStorageUsed = guests.reduce((sum, g) => sum + (g.storage_used_bytes || 0), 0);
  const totalStorageLimit = 1000 * 1024 * 1024; // 1000 MB

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={24} className="text-burgundy animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Inviti</h1>
          <p className="text-sm text-muted mt-1">
            Invita fino a 5 amici a usare Venganza Transfer.
          </p>
        </div>
        <Btn variant="primary" onClick={handleCreate} disabled={creating}>
          {creating ? <Loader2 size={14} className="animate-spin" /> : <UserPlus size={14} />}
          Genera invito
        </Btn>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users size={14} className="text-burgundy-muted" />
            <span className="label-meta">Ospiti attivi</span>
          </div>
          <p className="text-2xl font-bold text-ink">{guests.length} <span className="text-sm text-muted font-normal">/ 5</span></p>
        </div>

        <div className="glass rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Gift size={14} className="text-burgundy-muted" />
            <span className="label-meta">Codici generati</span>
          </div>
          <p className="text-2xl font-bold text-ink">{invites.length}</p>
        </div>

        <div className="glass rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <HardDrive size={14} className="text-burgundy-muted" />
            <span className="label-meta">Storage totale</span>
          </div>
          <p className="text-2xl font-bold text-ink">
            {formatBytes(totalStorageUsed)}
            <span className="text-sm text-muted font-normal"> / 1 GB</span>
          </p>
          <div className="mt-2 h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-burgundy rounded-full transition-all"
              style={{ width: `${Math.min((totalStorageUsed / totalStorageLimit) * 100, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Invite codes list */}
      <div className="glass rounded-lg overflow-hidden">
        <div className="px-5 py-3 border-b border-white/10">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
            Codici Invito
          </h2>
        </div>

        {invites.length === 0 ? (
          <div className="text-center py-10">
            <Gift size={28} className="text-subtle mx-auto mb-2 opacity-30" />
            <p className="text-sm text-subtle">Nessun codice generato.</p>
            <p className="text-xs text-subtle mt-1">Clicca "Genera invito" per iniziare.</p>
          </div>
        ) : (
          <div className="divide-y divide-white/8">
            {invites.map(inv => {
              const isUsed = !!inv.used_by;
              const guest = isUsed ? guestMap[inv.used_by] : null;

              return (
                <div key={inv.id} className="px-5 py-3.5 flex items-center gap-4">
                  {/* Code */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <code className="text-sm font-mono font-bold text-ink tracking-widest">
                        {inv.code}
                      </code>
                      <span className={`text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded ${
                        isUsed
                          ? 'bg-green-900/40 text-green-400'
                          : 'bg-amber-900/40 text-amber-400'
                      }`}>
                        {isUsed ? 'Usato' : 'Disponibile'}
                      </span>
                    </div>
                    {isUsed && guest && (
                      <p className="text-xs text-muted mt-0.5">
                        Usato da: {guest.display_name || 'Ospite'} &middot; Storage: {formatBytes(guest.storage_used_bytes || 0)} / {inv.max_storage_mb || 100} MB
                      </p>
                    )}
                    {isUsed && !guest && (
                      <p className="text-xs text-muted mt-0.5">
                        Usato il {new Date(inv.used_at).toLocaleDateString('it-IT')}
                      </p>
                    )}
                  </div>

                  {/* Copy button */}
                  {!isUsed && (
                    <Btn
                      size="sm"
                      variant="secondary"
                      onClick={() => copyInviteLink(inv.code, inv.id)}
                    >
                      {copiedId === inv.id ? (
                        <Check size={12} className="text-green-400" />
                      ) : (
                        <Copy size={12} />
                      )}
                      <span className="hidden sm:inline">
                        {copiedId === inv.id ? 'Copiato' : 'Copia link'}
                      </span>
                    </Btn>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Guest profiles */}
      {guests.length > 0 && (
        <div className="glass rounded-lg overflow-hidden">
          <div className="px-5 py-3 border-b border-white/10">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
              Utenti Ospiti
            </h2>
          </div>
          <div className="divide-y divide-white/8">
            {guests.map(g => (
              <div key={g.id} className="px-5 py-3.5 flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-burgundy/20 flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-burgundy-muted">
                    {(g.display_name || '?')[0].toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-ink">{g.display_name || 'Ospite'}</p>
                  <p className="text-xs text-muted">
                    Registrato il {new Date(g.created_at).toLocaleDateString('it-IT')}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-mono text-ink">{formatBytes(g.storage_used_bytes || 0)}</p>
                  <p className="text-[10px] text-subtle">/ 100 MB</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
