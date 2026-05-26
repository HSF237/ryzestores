import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, Mail, User, Calendar, ShieldCheck, ShieldAlert } from 'lucide-react'
import { userService } from '../services/firebaseService'

export default function CustomerManager() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await userService.getAllUsers()
        setUsers(data)
      } catch (err) {
        setError('Failed to fetch user list. Are you authorized?')
      } finally {
        setLoading(false)
      }
    }
    fetchUsers()
  }, [])

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return (
    <div className="h-96 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#c9a962] border-t-transparent rounded-full animate-spin"></div>
    </div>
  )

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-4xl font-outfit font-black uppercase tracking-tighter mb-2">Customer Base</h2>
          <p className="text-white/40 text-sm font-medium">Manage and view all registered ryze members.</p>
        </div>

        <div className="relative max-w-sm w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3 text-sm outline-none focus:border-[#c9a962]/50 transition-all font-medium"
          />
        </div>
      </div>

      {error ? (
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 text-red-400 text-sm font-bold">
          {error}
        </div>
      ) : (
        <div className="bg-[#111113] rounded-3xl border border-white/5 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.02]">
                  <th className="px-8 py-5 text-[10px] font-black text-[#c9a962] uppercase tracking-[0.2em]">Member</th>
                  <th className="px-8 py-5 text-[10px] font-black text-[#c9a962] uppercase tracking-[0.2em]">Email Address</th>
                  <th className="px-8 py-5 text-[10px] font-black text-[#c9a962] uppercase tracking-[0.2em]">Role</th>
                  <th className="px-8 py-5 text-[10px] font-black text-[#c9a962] uppercase tracking-[0.2em]">Joined Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredUsers.length > 0 ? filteredUsers.map((u, idx) => (
                  <motion.tr
                    key={u._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="group hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center font-outfit font-black text-[10px] border border-white/10 group-hover:border-[#c9a962]/30 transition-colors">
                          {u.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                        <span className="font-bold text-sm tracking-tight">{u.name}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2 text-white/50 group-hover:text-white/80 transition-colors">
                        <Mail className="w-3 h-3" />
                        <span className="text-sm font-medium italic">{u.email}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${u.role === 'admin'
                          ? 'bg-[#c9a962]/10 text-[#c9a962] border border-[#c9a962]/20'
                          : 'bg-white/5 text-white/40 border border-white/10'
                        }`}>
                        {u.role === 'admin' ? <ShieldCheck className="w-3 h-3" /> : <ShieldAlert className="w-3 h-3 opacity-30" />}
                        {u.role}
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2 text-white/30 text-xs font-bold">
                        <Calendar className="w-3 h-3" />
                        {new Date(u.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </div>
                    </td>
                  </motion.tr>
                )) : (
                  <tr>
                    <td colSpan="4" className="px-8 py-20 text-center text-white/20 font-black uppercase tracking-widest text-xs">
                      No members found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
