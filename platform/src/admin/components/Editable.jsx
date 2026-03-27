import { useState } from 'react';
import { useEditor } from '../lib/editor-context';
import { Pencil } from 'lucide-react';

/**
 * Wraps any element to make it editable in edit mode.
 * Usage: <Editable id="hero-title" type="text">{children}</Editable>
 */
export default function Editable({ id, type = 'text', children, className = '' }) {
  const { editMode, pendingChanges, updateField } = useEditor();
  const [editing, setEditing] = useState(false);

  if (!editMode) return children;

  const currentValue = pendingChanges[id];

  return (
    <div
      className={`relative group ${className}`}
      onDoubleClick={() => setEditing(true)}
    >
      {/* Highlight border */}
      <div className="absolute inset-0 border-2 border-transparent group-hover:border-amber-400/50 rounded pointer-events-none transition-colors z-50" />

      {/* Edit icon */}
      <button
        onClick={() => setEditing(true)}
        className="absolute -top-2 -right-2 w-6 h-6 bg-amber-400 text-black rounded-full items-center justify-center z-50 opacity-0 group-hover:opacity-100 transition-opacity hidden group-hover:flex shadow-lg"
      >
        <Pencil size={10} />
      </button>

      {editing && type === 'text' ? (
        <input
          autoFocus
          defaultValue={currentValue ?? (typeof children === 'string' ? children : '')}
          onBlur={(e) => {
            updateField(id, e.target.value);
            setEditing(false);
          }}
          onKeyDown={(e) => { if (e.key === 'Enter') e.target.blur(); }}
          className="w-full bg-amber-400/10 border border-amber-400/50 rounded px-2 py-1 text-inherit font-inherit outline-none"
        />
      ) : (
        children
      )}
    </div>
  );
}
