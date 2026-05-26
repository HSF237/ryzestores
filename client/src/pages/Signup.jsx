import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, User, ShoppingBag, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Signup() {
  const { signup } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return }
    setLoading(true)
    try {
      await signup(name, email, password)
      navigate('/')
    } catch (err) {
      const msg = err?.code === 'auth/email-already-in-use' ? 'This email is already registered.'
        : err?.code === 'auth/weak-password' ? 'Password is too weak. Use at least 6 characters.'
        : err?.code === 'auth/invalid-email' ? 'Please enter a valid email address.'
        : err?.message || 'Signup failed. Please try again.'
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
        <Link to="/" className="flex items-center gap-2 justify-center mb-10">
          <div className="w-9 h-9 bg-[#c9a962] rounded-xl flex items-center justify-center">
            <ShoppingBag className="w-5 h-5 text-black" />
          </div>
          <span className="font-outfit font-black text-2xl text-white">RY<span className="text-[#c9a962]">ZE</span></span>
        </Link>

        <div className="bg-[#111113] rounded-3xl border border-white/10 p-8 shadow-2xl shadow-black/50">
          <h1 className="font-outfit font-black text-2xl text-white mb-1">Join RYZE</h1>
          <p className="text-white/40 text-sm mb-8">Create your account for free.</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-[10px] font-black text-[#c9a962] uppercase tracking-widest mb-2 block">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="Muhammad Hasan"
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm focus:border-[#c9a962]/50 focus:outline-none transition-all" />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black text-[#c9a962] uppercase tracking-widest mb-2 block">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@email.com"
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm focus:border-[#c9a962]/50 focus:outline-none transition-all" />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black text-[#c9a962] uppercase tracking-widest mb-2 block">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required placeholder="Min 6 characters"
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-12 py-3 text-sm focus:border-[#c9a962]/50 focus:outline-none transition-all" />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
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
              type="submit" disabled={loading}
              className="w-full bg-[#c9a962] text-black font-black py-4 rounded-2xl text-sm uppercase tracking-wide hover:bg-[#b09452] disabled:opacity-50 transition-all shadow-lg shadow-[#c9a962]/20"
              whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
            >
              {loading ? 'Creating Account…' : 'Create My Account'}
            </motion.button>
          </form>

          <p className="text-center text-white/40 text-sm mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-[#c9a962] font-bold hover:underline">Sign In</Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
