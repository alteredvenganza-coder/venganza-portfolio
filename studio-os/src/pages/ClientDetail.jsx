import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Edit2, Trash2, Plus, Mail, Phone, Globe, FileText } from 'lucide-react';
import ProjectCard from '../components/ProjectCard';
import Btn from '../components/Btn';
import Panel from '../components/Panel';
import Modal from '../components/Modal';
import ClientForm from '../forms/ClientForm';
import ProjectForm from '../forms/ProjectForm';
import { useClients, useProjects } from '../hooks/useStore';
import { formatDate, initials } from '../lib/utils';

export default function ClientDetail() {
  const { id }       = useParams();
  const navigate     = useNavigate();
  const { getClient, updateClient, deleteClient, clients } = useClients();
  const { getProjectsByClient, addProject } = useProjects();

  const client   = getClient(id);
  const projects = getProjectsByClient(id);

  const [editOpen,    setEditOpen]    = useState(false);
  const [confirmDel,  setConfirmDel]  = useState(false);
  const [addProjOpen, setAddProjOpen] = useState(false);

  if (!client) {
    return (
      <div className="text-center py-20">
        <p className="text-muted mb-4">Cliente non trovato.</p>
        <Link to="/clients" className="text-burgundy text-sm hover:underline">← Torna ai clienti</Link>
      </div>
    );
  }

  function handleDelete() {
    deleteClient(id);
    navigate('/clients');
  }

  const active    = projects.filter(p => p.stage !== 'completed');
  const completed = projects.filter(p => p.stage === 'completed');

  return (
    <>
      {/* Back */}
      <Link
        to="/clients"
        className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink transition-colors mb-6"
      >
        <ArrowLeft size={14} /> Clienti
      </Link>

      {/* Header card */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-border rounded-lg shadow-card p-6 mb-6"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="w-14 h-14 rounded-full bg-burgundy-pale flex items-center justify-center shrink-0">
              <span className="font-display text-xl font-semibold text-burgundy">
                {initials(client.name)}
              </span>
            </div>

            <div>
              <h1 className="font-display text-2xl font-semibold text-ink">{client.name}</h1>
              {client.brand && (
                <p className="label-meta mt-1">{client.brand}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Btn variant="secondary" size="sm" onClick={() => setEditOpen(true)}>
              <Edit2 size={13} /> Modifica
            </Btn>
            <Btn variant="danger" size="sm" onClick={() => setConfirmDel(true)}>
              <Trash2 size={13} />
            </Btn>
          </div>
        </div>

        {/* Contact info */}
        <div className="flex flex-wrap gap-4 mt-5 pt-5 border-t border-border">
          {client.email && (
            <a
              href={`mailto:${client.email}`}
              className="flex items-center gap-1.5 text-sm text-muted hover:text-burgundy transition-colors"
            >
              <Mail size={13} /> {client.email}
            </a>
          )}
          {client.phone && (
            <a
              href={`tel:${client.phone}`}
              className="flex items-center gap-1.5 text-sm text-muted hover:text-burgundy transition-colors"
            >
              <Phone size={13} /> {client.phone}
            </a>
          )}
          {client.language && (
            <span className="flex items-center gap-1.5 text-sm text-muted">
              <Globe size={13} /> {client.language}
            </span>
          )}
          <span className="ml-auto label-meta">
            Cliente dal {formatDate(client.createdAt)}
          </span>
        </div>

        {client.notes && (
          <div className="mt-4 pt-4 border-t border-border">
            <p className="label-meta mb-1.5">Note</p>
            <p className="text-sm text-muted leading-relaxed whitespace-pre-wrap">{client.notes}</p>
          </div>
        )}
      </motion.div>

      {/* Projects */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-xl font-semibold text-ink">
          Progetti <span className="text-muted font-sans text-base font-normal">({projects.length})</span>
        </h2>
        <Btn variant="primary" size="sm" onClick={() => setAddProjOpen(true)}>
          <Plus size={14} /> Nuovo progetto
        </Btn>
      </div>

      {projects.length === 0 ? (
        <div className="bg-white border border-border rounded-lg p-8 text-center">
          <FileText size={28} className="text-subtle mx-auto mb-3" />
          <p className="text-sm text-muted mb-4">Nessun progetto per questo cliente.</p>
          <Btn variant="primary" onClick={() => setAddProjOpen(true)}>
            <Plus size={14} /> Aggiungi progetto
          </Btn>
        </div>
      ) : (
        <>
          {active.length > 0 && (
            <div className="mb-4">
              <p className="label-meta mb-3">Attivi ({active.length})</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {active.map(p => (
                  <ProjectCard key={p.id} project={p} />
                ))}
              </div>
            </div>
          )}
          {completed.length > 0 && (
            <div>
              <p className="label-meta mb-3">Completati ({completed.length})</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {completed.map(p => (
                  <ProjectCard key={p.id} project={p} />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Edit modal */}
      <ClientForm
        open={editOpen}
        onClose={() => setEditOpen(false)}
        initialValues={client}
        onSave={(data) => { updateClient(id, data); setEditOpen(false); }}
      />

      {/* Add project modal */}
      <ProjectForm
        open={addProjOpen}
        onClose={() => setAddProjOpen(false)}
        clients={clients}
        defaultClientId={id}
        onSave={(data) => { addProject(data); setAddProjOpen(false); }}
      />

      {/* Confirm delete */}
      <Modal open={confirmDel} onClose={() => setConfirmDel(false)} title="Elimina cliente" width="max-w-sm">
        <p className="text-sm text-muted mb-6">
          Sei sicuro di voler eliminare <strong className="text-ink">{client.name}</strong>?
          I progetti associati rimarranno.
        </p>
        <div className="flex justify-end gap-2">
          <Btn variant="secondary" onClick={() => setConfirmDel(false)}>Annulla</Btn>
          <Btn variant="danger" onClick={handleDelete}>Elimina</Btn>
        </div>
      </Modal>
    </>
  );
}
