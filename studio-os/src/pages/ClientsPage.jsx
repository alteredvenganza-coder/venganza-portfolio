import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Users } from 'lucide-react';
import ClientCard from '../components/ClientCard';
import Btn from '../components/Btn';
import ClientForm from '../forms/ClientForm';
import { useClients, useProjects } from '../hooks/useStore';

export default function ClientsPage() {
  const { clients, addClient } = useClients();
  const { projects }           = useProjects();

  const [query, setQuery]     = useState('');
  const [showForm, setShowForm] = useState(false);

  const q = query.trim().toLowerCase();
  const filtered = q
    ? clients.filter(
        c =>
          c.name?.toLowerCase().includes(q) ||
          c.brand?.toLowerCase().includes(q) ||
          c.email?.toLowerCase().includes(q)
      )
    : clients;

  function projectCount(clientId) {
    return projects.filter(p => p.clientId === clientId).length;
  }

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-ink">Clienti</h1>
          <p className="text-sm text-muted mt-1">
            {clients.length} {clients.length === 1 ? 'cliente' : 'clienti'}
          </p>
        </div>
        <Btn variant="primary" onClick={() => setShowForm(true)}>
          <Plus size={14} /> Nuovo cliente
        </Btn>
      </div>

      {/* Search */}
      {clients.length > 0 && (
        <div className="relative mb-6 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-subtle pointer-events-none" />
          <input
            type="text"
            placeholder="Cerca per nome, brand, email…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="pl-9 text-sm"
          />
        </div>
      )}

      {/* List */}
      {clients.length === 0 ? (
        <div className="bg-white border border-border rounded-lg p-12 text-center">
          <Users size={32} className="text-subtle mx-auto mb-3" />
          <p className="text-sm text-muted mb-4">Nessun cliente ancora.<br />Aggiungine uno per iniziare.</p>
          <Btn variant="primary" onClick={() => setShowForm(true)}>
            <Plus size={14} /> Aggiungi cliente
          </Btn>
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-muted">Nessun risultato per "{query}".</p>
      ) : (
        <motion.div
          className="flex flex-col gap-3"
          initial="hidden"
          animate="visible"
          variants={{
            visible: { transition: { staggerChildren: 0.04 } },
            hidden:  {},
          }}
        >
          {filtered.map(client => (
            <motion.div
              key={client.id}
              variants={{
                hidden:  { opacity: 0, y: 6 },
                visible: { opacity: 1, y: 0 },
              }}
            >
              <ClientCard
                client={client}
                projectCount={projectCount(client.id)}
              />
            </motion.div>
          ))}
        </motion.div>
      )}

      <ClientForm
        open={showForm}
        onClose={() => setShowForm(false)}
        onSave={(data) => { addClient(data); setShowForm(false); }}
      />
    </>
  );
}
