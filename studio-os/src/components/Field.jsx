// Labelled form field wrapper
export default function Field({ label, required, error, children, className = '' }) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label className="label-meta">
          {label}
          {required && <span className="text-burgundy ml-0.5">*</span>}
        </label>
      )}
      {children}
      {error && (
        <p className="text-[11px] text-burgundy font-mono">{error}</p>
      )}
    </div>
  );
}
