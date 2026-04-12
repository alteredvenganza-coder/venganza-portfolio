import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight, Mail, Phone } from 'lucide-react';
import { initials } from '../lib/utils';

export default function ClientCard({ client, projectCount = 0 }) {
  return (
    <motion.div
      whileHover={{ y: -1 }}
      transition={{ duration: 0.15 }}
    >
      <Link
        to={`/clients/${client.id}`}
        className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-white border border-border rounded-lg shadow-card hover:border-burgundy-muted transition-colors group"
      >
        {/* Avatar */}
        <div className="w-9 sm:w-10 h-9 sm:h-10 rounded-full bg-burgundy-pale flex items-center justify-center shrink-0">
          <span className="font-display text-sm font-semibold text-burgundy">
            {initials(client.name)}
          </span>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm text-ink truncate">{client.name}</p>
          {client.brand && (
            <p className="label-meta mt-0.5 truncate">{client.brand}</p>
          )}
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mt-1">
            {client.email && (
              <span className="flex items-center gap-1 text-[11px] text-subtle">
                <Mail size={11} /> {client.email}
              </span>
            )}
            {client.phone && (
              <span className="flex items-center gap-1 text-[11px] text-subtle">
                <Phone size={11} /> {client.phone}
              </span>
            )}
          </div>
        </div>

        {/* Project count */}
        <div className="text-center shrink-0">
          <p className="text-base sm:text-lg font-display font-semibold text-ink">{projectCount}</p>
          <p className="label-meta">{projectCount === 1 ? 'progetto' : 'progetti'}</p>
        </div>

        <ChevronRight size={16} className="text-subtle group-hover:text-burgundy transition-colors shrink-0" />
      </Link>
    </motion.div>
  );
}
