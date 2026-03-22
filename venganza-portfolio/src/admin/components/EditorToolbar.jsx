import { useEditor } from '../lib/editor-context';
import { X, Save, RotateCcw, PenTool } from 'lucide-react';

/**
 * Floating toolbar shown when edit mode is active on the frontend.
 */
export default function EditorToolbar() {
  const { editMode, exitEditMode, hasUnsaved, discardChanges } = useEditor();

  if (!editMode) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[300] flex items-center gap-2 bg-[#111] border border-white/10 rounded-xl px-4 py-2 shadow-2xl">
      <PenTool size={14} className="text-amber-400 mr-1" />
      <span className="font-mono text-[10px] text-white/60 uppercase tracking-widest mr-3">Edit Mode</span>

      {hasUnsaved && (
        <>
          <button
            onClick={discardChanges}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-mono uppercase tracking-widest text-white/50 hover:text-white hover:bg-white/10 transition-all"
          >
            <RotateCcw size={12} /> Discard
          </button>
          <button
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-mono uppercase tracking-widest bg-green-500 text-black hover:bg-green-400 transition-all"
          >
            <Save size={12} /> Publish
          </button>
        </>
      )}

      <button
        onClick={exitEditMode}
        className="ml-2 p-1.5 rounded-lg text-white/30 hover:text-white hover:bg-white/10 transition-all"
        title="Exit edit mode"
      >
        <X size={14} />
      </button>
    </div>
  );
}
