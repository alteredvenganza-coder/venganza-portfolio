export default function Footer() {
  return (
    <footer className="bg-charcoal text-cream rounded-t-[3rem] px-6 py-12 relative overflow-hidden z-20 border-t border-charcoal/10 shadow-[0_-20px_40px_rgba(0,0,0,0.2)]">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
        
        <div className="flex flex-col items-center md:items-start gap-3">
          <div className="text-2xl font-sans font-extrabold tracking-tight">
            MAT<span className="text-clay">Renders</span>
          </div>
          <div className="font-mono text-[10px] text-cream/40 uppercase tracking-widest">
            By Altered Venganz
          </div>
        </div>

        <div className="flex gap-8 text-xs font-mono text-cream/50">
          <a href="#" className="hover:text-cream transition-colors">Documentation</a>
          <a href="#" className="hover:text-cream transition-colors">API Keys</a>
          <a href="#" className="hover:text-cream transition-colors">Terms</a>
        </div>

        <div className="flex items-center gap-3 bg-cream/5 px-4 py-2 rounded-full border border-cream/10">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.6)]"></div>
          <span className="text-[10px] font-mono tracking-widest text-cream/70 uppercase">
            Systems Online
          </span>
        </div>

      </div>
    </footer>
  );
}
