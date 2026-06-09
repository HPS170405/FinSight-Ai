import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export default function Chat() {
  const { token } = useAuth()
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hi! Ask me anything about your portfolio or market trends.' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef()

  useEffect(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), [messages])

  const send = async () => {
    if (!input.trim()) return
    const userMsg = { role: 'user', content: input }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const { data } = await axios.post(`${API}/api/chat`,
        { message: input },
        { headers: { Authorization: `Bearer ${token}` } })
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, something went wrong.' }])
    }
    setLoading(false)
  }

  return (
    <div className="flex flex-col h-full max-w-2xl">
      <h2 className="text-2xl font-bold text-white mb-4">AI Portfolio Chat</h2>

      <div className="flex-1 overflow-auto space-y-4 mb-4 bg-slate-800 rounded-xl p-4 border border-slate-700">
        {messages.map((m, i) => (
          <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0
              ${m.role === 'assistant' ? 'bg-blue-600' : 'bg-slate-600'}`}>
              {m.role === 'assistant' ? <Bot size={16} /> : <User size={16} />}
            </div>
            <div className={`max-w-sm px-4 py-3 rounded-xl text-sm leading-relaxed
              ${m.role === 'assistant' ? 'bg-slate-700 text-slate-200' : 'bg-blue-600 text-white'}`}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
              <Bot size={16} />
            </div>
            <div className="bg-slate-700 rounded-xl px-4 py-3 text-slate-400 text-sm">
              Thinking...
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="flex gap-3">
        <input
          type="text"
          placeholder="Ask about your portfolio..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
          className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2
                     text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
        />
        <button onClick={send} disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-colors">
          <Send size={18} />
        </button>
      </div>
    </div>
  )
}
