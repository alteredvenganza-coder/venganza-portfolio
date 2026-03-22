export default function PremadeCard({ premade, onClick }) {
  return (
    <button
      onClick={() => onClick(premade)}
      className="group text-left w-full bg-white border border-charcoal/5 rounded-2xl overflow-hidden transition-all duration-500 hover:shadow-xl hover:shadow-charcoal/5 hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-clay/30"
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-neutral-100">
        <img
          src={premade.imageUrl}
          alt={`Premade #${premade.number}`}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-charcoal/0 group-hover:bg-charcoal/20 transition-colors duration-500 flex items-center justify-center">
          <span className="font-mono text-sm text-cream opacity-0 group-hover:opacity-100 transition-opacity duration-300 tracking-widest uppercase">
            View
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="p-4 flex items-center justify-between">
        <span className="font-mono text-xs tracking-wider text-charcoal/70 uppercase">
          Premade #{premade.number}
        </span>
        <span className="font-sans text-sm font-semibold text-charcoal">
          ${premade.price}
        </span>
      </div>
    </button>
  );
}
