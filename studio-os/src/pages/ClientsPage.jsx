// Studio OS — Clients

export default function ClientsPage() {
  return (
    <div className="p-8">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <p className="text-xs font-mono tracking-widest text-[#555] uppercase">Studio OS</p>
          <h1 className="text-2xl font-semibold text-white mt-1">Clients</h1>
        </div>
        <button className="bg-[#7b1f24] hover:bg-[#a82a30] text-white text-sm px-4 py-2 rounded-xl transition-colors">
          + Add client
        </button>
      </header>

      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-6">
        <p className="text-sm text-[#555]">No clients yet.</p>
      </div>
    </div>
  );
}
