import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, ShoppingBag, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { login, googleSignIn } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const user = await login(email, password)
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

  const handleGoogle = async () => {
    setError('')
    setGoogleLoading(true)
    try {
      const user = await googleSignIn()
      if (user.role === 'staff' || user.role === 'admin') {
        navigate('/staff/dashboard')
      } else {
        navigate('/')
      }
    } catch (err) {
      setError(err?.code === 'auth/popup-closed-by-user' ? 'Sign-in cancelled.' : err?.message || 'Google sign-in failed.')
    } finally {
      setGoogleLoading(false)
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

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-white/30 text-xs font-bold uppercase tracking-widest">or</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <motion.button
            type="button"
            onClick={handleGoogle}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 bg-white text-black font-black py-4 rounded-2xl text-sm hover:bg-white/90 disabled:opacity-50 transition-all shadow-lg"
            whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            {googleLoading ? 'Signing in…' : 'Continue with Google'}
          </motion.button>

          <p className="text-center text-white/40 text-sm mt-6">
            New to RYZE?{' '}
            <Link to="/signup" className="text-[#c9a962] font-bold hover:underline">Create an account</Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
