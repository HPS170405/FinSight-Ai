export default function MetricCard({ label, value, change, positive }) {
  return (
    <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
      <p className="text-slate-400 text-sm">{label}</p>
      <p className="text-2xl font-bold text-white mt-1">{value}</p>
      {change && (
        <p className={`text-sm mt-1 ${positive ? 'text-green-400' : 'text-red-400'}`}>
          {positive ? '▲' : '▼'} {change}
        </p>
      )}
    </div>
  )
}
