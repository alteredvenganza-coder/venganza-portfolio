// Reusable badge with custom bg/text colors
export default function Badge({ label, bg, color, className = '' }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs sm:text-[11px] font-mono font-medium tracking-wide ${className}`}
      style={{ backgroundColor: bg, color }}
    >
      {label}
    </span>
  );
}
