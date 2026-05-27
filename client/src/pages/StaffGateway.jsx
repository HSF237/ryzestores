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
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState('')
  const { login, googleSignIn } = useAuth()
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

  const handleGoogle = async () => {
    setError('')
    setGoogleLoading(true)
    try {
      const user = await googleSignIn()
      if (user.role === 'staff' || user.role === 'admin') {
        navigate('/staff/dashboard')
      } else {
        setError('Access denied. Your Google account is not a staff account.')
      }
    } catch (err) {
      setError(err?.code === 'auth/popup-closed-by-user' ? 'Sign-in cancelled.' : err?.message || 'Google sign-in failed.')
    } finally {
      setGoogleLoading(false)
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

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-white/30 text-xs font-bold uppercase tracking-widest">or</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <motion.button
            type="button"
            onClick={handleGoogle}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 bg-white text-black font-black py-3 rounded-xl text-sm hover:bg-white/90 disabled:opacity-50 transition-all"
            whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            {googleLoading ? 'Verifying…' : 'Sign in with Google'}
          </motion.button>

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
