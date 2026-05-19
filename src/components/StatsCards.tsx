// @ts-nocheck
export function StatCard({ icon, label, value, detail }) {
  return <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><div className="flex items-center gap-3"><div className="rounded-xl bg-slate-100 p-2 text-slate-700">{icon}</div><div><p className="text-sm text-slate-500">{label}</p><p className="text-xl font-semibold text-slate-950">{value}</p></div></div><p className="mt-3 text-sm leading-5 text-slate-500">{detail}</p></div>;
}
