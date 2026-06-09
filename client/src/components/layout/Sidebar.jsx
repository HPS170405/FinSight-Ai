import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Search, MessageSquare, LogOut } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const links = [
  { to: '/', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
  { to: '/research', icon: <Search size={20} />, label: 'Research' },
  { to: '/chat', icon: <MessageSquare size={20} />, label: 'AI Chat' },
]

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <aside className="w-56 bg-slate-800 border-r border-slate-700 flex flex-col py-6 px-4">
      <div className="mb-8">
        <h1 className="text-xl font-bold text-white">FinSight <span className="text-blue-400">AI</span></h1>
        <p className="text-xs text-slate-400 mt-1">{user?.email}</p>
      </div>
      <nav className="flex-1 space-y-1">
        {links.map(link => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors
              ${isActive ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`
            }
          >
            {link.icon}
            {link.label}
          </NavLink>
        ))}
      </nav>
      <button onClick={handleLogout}
        className="flex items-center gap-2 text-slate-400 hover:text-red-400 text-sm px-3 py-2">
        <LogOut size={18} /> Logout
      </button>
    </aside>
  )
}
