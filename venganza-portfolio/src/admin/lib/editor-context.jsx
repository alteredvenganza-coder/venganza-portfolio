import { createContext, useContext, useState, useCallback } from 'react';

const EditorContext = createContext(null);

export function EditorProvider({ children }) {
  const [editMode, setEditMode] = useState(false);
  const [pendingChanges, setPendingChanges] = useState({});
  const [hasUnsaved, setHasUnsaved] = useState(false);

  const enterEditMode = () => setEditMode(true);
  const exitEditMode = () => {
    if (hasUnsaved && !window.confirm('You have unsaved changes. Discard?')) return;
    setEditMode(false);
    setPendingChanges({});
    setHasUnsaved(false);
  };

  const updateField = useCallback((id, value) => {
    setPendingChanges(prev => ({ ...prev, [id]: value }));
    setHasUnsaved(true);
  }, []);

  const discardChanges = () => {
    setPendingChanges({});
    setHasUnsaved(false);
  };

  return (
    <EditorContext.Provider value={{
      editMode, enterEditMode, exitEditMode,
      pendingChanges, updateField, discardChanges, hasUnsaved,
    }}>
      {children}
    </EditorContext.Provider>
  );
}

export function useEditor() {
  return useContext(EditorContext);
}
