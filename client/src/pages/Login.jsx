import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, ShoppingBag, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const user = await login(email, password)
      // Redirect staff to dashboard, customers to homepage
      if (user.role === 'staff' || user.role === 'admin') {
        navigate('/staff/dashboard')
      } else {
        navigate('/')
      }
    } catch (err) {
      const msg = err?.code === 'auth/invalid-credential' ? 'Invalid email or password.'
        : err?.code === 'auth/user-not-found' ? 'No account found with this email.'
        : err?.code === 'auth/wrong-password' ? 'Incorrect password.'
        : err?.code === 'auth/too-many-requests' ? 'Too many attempts. Try again later.'
        : err?.message || 'Login failed. Check your credentials.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 justify-center mb-10">
          <div className="w-9 h-9 bg-[#c9a962] rounded-xl flex items-center justify-center">
            <ShoppingBag className="w-5 h-5 text-black" />
          </div>
          <span className="font-outfit font-black text-2xl text-white">RY<span className="text-[#c9a962]">ZE</span></span>
        </Link>

        <div className="bg-[#111113] rounded-3xl border border-white/10 p-8 shadow-2xl shadow-black/50">
          <h1 className="font-outfit font-black text-2xl text-white mb-1">Welcome Back</h1>
          <p className="text-white/40 text-sm mb-8">Sign in to continue your RYZE experience.</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="text-[10px] font-black text-[#c9a962] uppercase tracking-widest mb-2 block">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  placeholder="you@email.com"
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm focus:border-[#c9a962]/50 focus:outline-none transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-[10px] font-black text-[#c9a962] uppercase tracking-widest mb-2 block">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-12 py-3 text-sm focus:border-[#c9a962]/50 focus:outline-none transition-all"
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-400 text-sm font-bold bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2">
                {error}
              </motion.p>
            )}

            <motion.button
              type="submit"
              disabled={loading}
              className="w-full bg-[#c9a962] text-black font-black py-4 rounded-2xl text-sm uppercase tracking-wide hover:bg-[#b09452] disabled:opacity-50 transition-all shadow-lg shadow-[#c9a962]/20"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </motion.button>
          </form>

          <p className="text-center text-white/40 text-sm mt-6">
            New to RYZE?{' '}
            <Link to="/signup" className="text-[#c9a962] font-bold hover:underline">Create an account</Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
