// Studio OS — Orders

export default function OrdersPage() {
  return (
    <div className="p-8">
      <header className="mb-8">
        <p className="text-xs font-mono tracking-widest text-[#555] uppercase">Studio OS</p>
        <h1 className="text-2xl font-semibold text-white mt-1">Orders</h1>
      </header>

      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-6">
        <p className="text-sm text-[#555]">No orders yet.</p>
      </div>
    </div>
  );
}
