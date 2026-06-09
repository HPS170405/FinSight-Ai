import { useEffect, useState, useCallback } from 'react'
import MetricCard from '../components/dashboard/MetricCard'
import StockChart from '../components/dashboard/StockChart'
import AnomalyAlert from '../components/dashboard/AnomalyAlert'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export default function Dashboard() {
  const { token } = useAuth()
  const [portfolio, setPortfolio] = useState([])
  const [anomalies, setAnomalies] = useState([])
  const [selected, setSelected] = useState(null)
  const [chartData, setChartData] = useState([])
  const [newTicker, setNewTicker] = useState('')
  const [newQty, setNewQty] = useState('')
  const [newPrice, setNewPrice] = useState('')
  const [toast, setToast] = useState(null)

  const showToast = useCallback((msg, type = 'error') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }, [])

  const fetchPortfolio = useCallback(() => {
    if (!token) return
    axios.get(`${API}/api/portfolio`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => {
        setPortfolio(r.data.portfolio)
        if (!selected && r.data.portfolio.length) setSelected(r.data.portfolio[0].ticker)
      })
      .catch(e => showToast(e.response?.data?.error || 'Failed to load portfolio'))
  }, [token, selected, showToast])

  useEffect(() => { fetchPortfolio() }, [fetchPortfolio])

  const addStock = async (e) => {
    e.preventDefault()
    if (!newTicker || !newQty || !newPrice) return
    try {
      await axios.post(`${API}/api/portfolio/stock`,
        { ticker: newTicker, quantity: parseInt(newQty), buy_price: parseFloat(newPrice) },
        { headers: { Authorization: `Bearer ${token}` } })
      setNewTicker(''); setNewQty(''); setNewPrice('')
      showToast(`${newTicker} added`, 'success')
      fetchPortfolio()
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to add stock')
    }
  }

  const removeStock = async (ticker) => {
    try {
      await axios.delete(`${API}/api/portfolio/stock/${ticker}`,
        { headers: { Authorization: `Bearer ${token}` } })
      showToast(`${ticker} removed`, 'success')
      fetchPortfolio()
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to remove stock')
    }
  }

  const totalValue = portfolio.reduce((sum, s) => sum + (s.current_price * s.quantity), 0)
  const totalCost = portfolio.reduce((sum, s) => sum + (s.buy_price * s.quantity), 0)
  const pnl = totalValue - totalCost
  const pnlPct = totalCost ? ((pnl / totalCost) * 100).toFixed(2) : 0

  return (
    <div className="space-y-6 relative">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-lg text-sm font-medium shadow-lg transition-all ${
          toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
        }`}>
          {toast.msg}
        </div>
      )}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Portfolio Dashboard</h2>
        <button onClick={fetchPortfolio}
          className="text-xs text-blue-400 hover:text-blue-300 px-3 py-1 rounded border border-blue-500/30 hover:bg-blue-500/10 transition-colors">
          Refresh Prices
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard label="Total Value" value={`₹${totalValue.toLocaleString()}`} />
        <MetricCard label="Total P&L" value={`₹${pnl.toFixed(0)}`}
          change={`${pnlPct}%`} positive={pnl >= 0} />
        <MetricCard label="Holdings" value={portfolio.length} />
        <MetricCard label="Anomalies" value={anomalies.length} />
      </div>

      {/* Anomaly Alerts */}
      {anomalies.map(a => <AnomalyAlert key={a.ticker} {...a} />)}

      {/* Add Stock Form */}
      <form onSubmit={addStock} className="flex gap-3 items-end">
        <div>
          <label className="text-xs text-slate-400 block mb-1">Ticker</label>
          <input type="text" value={newTicker} placeholder="e.g. AAPL"
            onChange={e => setNewTicker(e.target.value.toUpperCase())}
            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 w-32" />
        </div>
        <div>
          <label className="text-xs text-slate-400 block mb-1">Quantity</label>
          <input type="number" value={newQty} min="1"
            onChange={e => setNewQty(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 w-24" />
        </div>
        <div>
          <label className="text-xs text-slate-400 block mb-1">Buy Price</label>
          <input type="number" value={newPrice} min="0" step="0.01"
            onChange={e => setNewPrice(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 w-32" />
        </div>
        <button type="submit"
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
          Add Stock
        </button>
      </form>

      {/* Chart */}
      {chartData.length > 0 && <StockChart data={chartData} ticker={selected} />}

      {/* Holdings Table */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-700/50 text-slate-400">
            <tr>
              <th className="text-left px-4 py-3">Ticker</th>
              <th className="text-right px-4 py-3">Qty</th>
              <th className="text-right px-4 py-3">Buy Price</th>
              <th className="text-right px-4 py-3">Current</th>
              <th className="text-right px-4 py-3">P&L</th>
              <th className="text-right px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {portfolio.map(s => {
              const pnl = (s.current_price - s.buy_price) * s.quantity
              return (
                <tr key={s.ticker}
                  className="border-t border-slate-700 hover:bg-slate-700/30 cursor-pointer"
                  onClick={() => setSelected(s.ticker)}>
                  <td className="px-4 py-3 font-medium text-blue-400">{s.ticker}</td>
                  <td className="px-4 py-3 text-right">{s.quantity}</td>
                  <td className="px-4 py-3 text-right">₹{s.buy_price}</td>
                  <td className="px-4 py-3 text-right">₹{s.current_price}</td>
                  <td className={`px-4 py-3 text-right ${pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    ₹{pnl.toFixed(0)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={(e) => { e.stopPropagation(); removeStock(s.ticker) }}
                      className="text-red-400 hover:text-red-300 text-xs font-medium">
                      Remove
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
