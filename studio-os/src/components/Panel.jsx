import { motion } from 'framer-motion';

export default function Panel({ title, count, children, className = '', action }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`bg-white border border-border rounded-lg shadow-card ${className}`}
    >
      <header className="flex items-center justify-between px-5 py-4 border-b border-border">
        <div className="flex items-center gap-2">
          <h3 className="font-display text-base font-semibold text-ink">{title}</h3>
          {count !== undefined && (
            <span className="label-meta text-subtle">{count}</span>
          )}
        </div>
        {action}
      </header>
      <div className="p-5">{children}</div>
    </motion.section>
  );
}
