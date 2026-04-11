// Studio OS — Overview (home dashboard)

const STATS = [
  { label: 'Active Projects', value: '—' },
  { label: 'Open Orders',     value: '—' },
  { label: 'Clients',         value: '—' },
  { label: 'Scheduled Posts', value: '—' },
];

export default function OverviewPage() {
  return (
    <div className="p-8">
      <header className="mb-8">
        <p className="text-xs font-mono tracking-widest text-[#555] uppercase">Dashboard</p>
        <h1 className="text-2xl font-semibold text-white mt-1">Overview</h1>
      </header>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {STATS.map(({ label, value }) => (
          <div key={label} className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-5">
            <p className="text-[10px] font-mono tracking-widest text-[#555] uppercase mb-2">{label}</p>
            <p className="text-3xl font-display tracking-wide text-white">{value}</p>
          </div>
        ))}
      </div>

      {/* Placeholder sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-6">
          <p className="text-xs font-mono tracking-widest text-[#555] uppercase mb-4">Recent Orders</p>
          <p className="text-sm text-[#555]">No orders yet.</p>
        </div>
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-6">
          <p className="text-xs font-mono tracking-widest text-[#555] uppercase mb-4">Active Projects</p>
          <p className="text-sm text-[#555]">No projects yet.</p>
        </div>
      </div>
    </div>
  );
}
