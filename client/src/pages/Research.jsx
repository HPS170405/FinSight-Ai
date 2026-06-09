import { useState } from 'react'
import { Search, FileText, Loader } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import ReactMarkdown from 'react-markdown'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export default function Research() {
  const { token } = useAuth()
  const [ticker, setTicker] = useState('')
  const [loading, setLoading] = useState(false)
  const [report, setReport] = useState(null)

  const runResearch = async () => {
    if (!ticker) return
    setLoading(true)
    setReport(null)
    try {
      await axios.post(`${API}/api/agents/research/${ticker}`,
        {}, { headers: { Authorization: `Bearer ${token}` } })

      // Poll for report
      let attempts = 0
      const poll = setInterval(async () => {
        attempts++
        const r = await axios.get(`${API}/api/agents/report/${ticker}`,
          { headers: { Authorization: `Bearer ${token}` } })
        if (r.data.report) {
          setReport(r.data.report)
          setLoading(false)
          clearInterval(poll)
        }
        if (attempts > 30) { setLoading(false); clearInterval(poll) }
      }, 5000)
    } catch {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <h2 className="text-2xl font-bold text-white">AI Research Agent</h2>
      <p className="text-slate-400 text-sm">
        Enter a ticker to trigger the 3-agent research pipeline.
        The system will fetch data, analyze trends, and generate a full equity research report.
      </p>

      <div className="flex gap-3">
        <input
          type="text"
          placeholder="e.g. AAPL, RELIANCE.BSE"
          value={ticker}
          onChange={e => setTicker(e.target.value.toUpperCase())}
          className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2
                     text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
        />
        <button onClick={runResearch} disabled={loading}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50
                     text-white px-5 py-2 rounded-lg font-medium transition-colors">
          {loading ? <Loader size={16} className="animate-spin" /> : <Search size={16} />}
          {loading ? 'Researching...' : 'Run Research'}
        </button>
      </div>

      {loading && (
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
            <p className="text-slate-300 text-sm">Research Agent gathering stock data & news...</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
            <p className="text-slate-300 text-sm">Analysis Agent running quantitative analysis...</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
            <p className="text-slate-300 text-sm">Report Agent writing equity research report...</p>
          </div>
        </div>
      )}

      {report && (
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold flex items-center gap-2">
              <FileText size={18} /> Research Report — {ticker}
            </h3>
          </div>
          <div className="prose prose-invert prose-sm max-w-none text-slate-300">
            <ReactMarkdown
              components={{
                table: ({children}) => (
                  <div className="overflow-x-auto my-3">
                    <table className="min-w-full text-sm border-collapse border border-slate-600">{children}</table>
                  </div>
                ),
                th: ({children}) => (
                  <th className="border border-slate-600 bg-slate-700/50 px-3 py-2 text-left font-semibold text-blue-300">{children}</th>
                ),
                td: ({children}) => (
                  <td className="border border-slate-600 px-3 py-2">{children}</td>
                ),
                strong: ({children}) => <strong className="text-blue-300">{children}</strong>,
                h1: ({children}) => <h1 className="text-xl font-bold text-white mt-5 mb-3">{children}</h1>,
                h2: ({children}) => <h2 className="text-lg font-bold text-white mt-4 mb-2">{children}</h2>,
                h3: ({children}) => <h3 className="text-base font-bold text-white mt-3 mb-1">{children}</h3>,
                ul: ({children}) => <ul className="list-disc pl-5 my-2 space-y-1">{children}</ul>,
              }}
            >
              {report.content}
            </ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  )
}
