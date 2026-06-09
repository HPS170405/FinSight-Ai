import { AlertTriangle } from 'lucide-react'

export default function AnomalyAlert({ ticker, score, is_anomalous }) {
  if (!is_anomalous) return null
  return (
    <div className="bg-red-900/30 border border-red-500/50 rounded-xl p-4 flex items-start gap-3">
      <AlertTriangle className="text-red-400 mt-0.5" size={20} />
      <div>
        <p className="text-red-300 font-medium text-sm">{ticker} — Anomaly Detected</p>
        <p className="text-slate-400 text-xs mt-1">
          Unusual price movement detected. Anomaly score: {score?.toFixed(3)}. 
          Consider reviewing your position.
        </p>
      </div>
    </div>
  )
}
