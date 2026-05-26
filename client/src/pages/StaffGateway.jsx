import { useState } from 'react'
import { motion } from 'framer-motion'
import { Lock, ArrowRight, ShieldCheck } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/**
 * Hidden staff gateway — no link in main store UI.
 * Access via: /staff-gateway
 */
export default function StaffGateway() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const user = await login(email, password)
      if (user.role === 'staff' || user.role === 'admin') {
        navigate('/staff/dashboard')
      } else {
        setError('Access denied. This portal is for staff only.')
      }
    } catch (err) {
      setError(err?.code === 'auth/invalid-credential' ? 'Invalid credentials.' : err?.message || 'Authentication failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center p-4 font-jakarta">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="glass rounded-2xl border border-white/10 p-8 shadow-2xl">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-[#c9a962]/10 border border-[#c9a962]/20 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-[#c9a962]" />
            </div>
            <div>
              <h1 className="font-outfit font-bold text-xl text-white">Staff Gateway</h1>
              <p className="text-white/40 text-sm">Authorized access only</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-xs font-black text-[#c9a962] uppercase tracking-widest mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-[#c9a962]/50 transition-all"
                placeholder="staff@ryzestore.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-black text-[#c9a962] uppercase tracking-widest mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-[#c9a962]/50 transition-all"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2 font-bold">
                {error}
              </motion.p>
            )}

            <motion.button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-[#c9a962] text-black font-outfit font-black flex items-center justify-center gap-2 hover:bg-[#b09452] disabled:opacity-50 transition-all"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              {loading ? 'Verifying…' : 'Sign In to Staff Portal'}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </motion.button>
          </form>

          <p className="mt-6 text-center text-white/30 text-xs">
            This area is not linked from the main store.
          </p>
        </div>

        <Link to="/" className="block text-center text-white/40 hover:text-white/70 text-sm mt-6 transition-colors">
          ← Back to Store
        </Link>
      </motion.div>
    </div>
  )
}
