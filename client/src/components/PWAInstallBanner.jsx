import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Download, Smartphone } from 'lucide-react'

const VISIT_KEY     = 'ryze_visit_count'
const NEXT_SHOW_KEY = 'ryze_pwa_next_show' // visit number at which to show again
const INSTALLED_KEY = 'ryze_pwa_installed'
const PROMPT_INTERVAL = 3 // re-ask every 3 visits after dismiss

export default function PWAInstallBanner() {
  const [show, setShow] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [isIOS, setIsIOS] = useState(false)
  const [installing, setInstalling] = useState(false)
  const [installed, setInstalled] = useState(false)

  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {})
    }

    // Already installed? Never show again.
    if (localStorage.getItem(INSTALLED_KEY)) return

    // Detect iOS (Safari doesn't support beforeinstallprompt)
    const iosDevice = /iphone|ipad|ipod/i.test(navigator.userAgent)
    setIsIOS(iosDevice)

    // Increment visit count
    const visits = parseInt(localStorage.getItem(VISIT_KEY) || '0', 10) + 1
    localStorage.setItem(VISIT_KEY, String(visits))

    // Check if we've reached the threshold visit to show the prompt
    // nextShow defaults to PROMPT_INTERVAL on first run (show after visit 3)
    const nextShow = parseInt(localStorage.getItem(NEXT_SHOW_KEY) || String(PROMPT_INTERVAL), 10)
    const shouldShow = visits >= nextShow

    // Capture the install prompt event (Android/Chrome)
    const handler = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      if (shouldShow) {
        setTimeout(() => setShow(true), 1500)
      }
    }
    window.addEventListener('beforeinstallprompt', handler)

    // For iOS: show the manual guide when threshold is reached
    if (iosDevice && shouldShow) {
      setTimeout(() => setShow(true), 1500)
    }

    // Hide permanently once installed via browser
    window.addEventListener('appinstalled', () => {
      localStorage.setItem(INSTALLED_KEY, '1')
      setShow(false)
    })

    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (isIOS) return // iOS shows manual guide, no programmatic install

    if (!deferredPrompt) return
    setInstalling(true)
    try {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === 'accepted') {
        setInstalled(true)
        localStorage.setItem(INSTALLED_KEY, '1')
        setTimeout(() => setShow(false), 2000)
      }
    } catch (err) {
      console.warn('PWA install failed', err)
    } finally {
      setInstalling(false)
      setDeferredPrompt(null)
    }
  }

  const handleDismiss = () => {
    setShow(false)
    // Schedule re-prompt after 3 more visits (never permanently dismissed)
    const visits = parseInt(localStorage.getItem(VISIT_KEY) || '0', 10)
    localStorage.setItem(NEXT_SHOW_KEY, String(visits + PROMPT_INTERVAL))
  }

  return (
    <AnimatePresence>
      {show && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleDismiss}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998]"
          />

          {/* Banner — slides up from bottom */}
          <motion.div
            initial={{ opacity: 0, y: 120 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 120 }}
            transition={{ type: 'spring', damping: 20, stiffness: 260 }}
            className="fixed bottom-0 left-0 right-0 z-[9999] px-4 pb-6 sm:pb-8"
          >
            <div className="max-w-md mx-auto bg-[#111113] rounded-[2rem] border border-[#c9a962]/30 shadow-[0_-20px_60px_rgba(201,169,98,0.15)] overflow-hidden">
              {/* Gold gradient top bar */}
              <div className="h-1 w-full bg-gradient-to-r from-[#c9a962] via-[#f0d080] to-[#c9a962]" />

              <div className="p-6 sm:p-8">
                {/* Header */}
                <div className="flex items-start justify-between mb-5">
                  <div className="flex items-center gap-4">
                    {/* App icon */}
                    <div className="w-16 h-16 rounded-[1.2rem] bg-[#0a0a0b] border border-white/10 flex items-center justify-center shadow-lg overflow-hidden">
                      <img
                        src="/mylogo.png"
                        alt="RYZE"
                        className="w-12 h-12 object-contain"
                      />
                    </div>
                    <div>
                      <h3 className="font-outfit font-black text-lg text-white leading-none mb-1">
                        RY<span className="text-[#c9a962]">ZE</span> App
                      </h3>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">
                        Install on your phone
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleDismiss}
                    className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all"
                  >
                    <X className="w-4 h-4 text-white/40" />
                  </button>
                </div>

                {/* Benefits */}
                <div className="space-y-2.5 mb-6">
                  {[
                    '⚡ Faster checkout — one tap to shop',
                    '🔔 Order updates straight to your screen',
                    '📴 Works even with slow internet',
                  ].map((benefit, i) => (
                    <div key={i} className="flex items-center gap-3 text-[11px] font-medium text-white/60">
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>

                {/* CTA — Android/Desktop */}
                {!isIOS && (
                  <button
                    onClick={handleInstall}
                    disabled={installing || installed}
                    className="w-full h-14 bg-[#c9a962] hover:bg-[#b09452] text-black font-black uppercase tracking-[0.2em] text-xs rounded-2xl flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 shadow-xl shadow-[#c9a962]/20"
                  >
                    {installed ? (
                      <>✅ Installed!</>
                    ) : installing ? (
                      <>Installing…</>
                    ) : (
                      <>
                        <Download className="w-4 h-4" />
                        Add to Home Screen
                      </>
                    )}
                  </button>
                )}

                {/* CTA — iOS manual guide */}
                {isIOS && (
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
                    <Smartphone className="w-5 h-5 text-[#c9a962] mx-auto mb-2" />
                    <p className="text-[11px] font-bold text-white/70 leading-relaxed">
                      Tap the <span className="text-white font-black">Share</span> button in Safari,
                      then choose{' '}
                      <span className="text-[#c9a962] font-black">"Add to Home Screen"</span>
                    </p>
                  </div>
                )}

                {/* Dismiss link */}
                <button
                  onClick={handleDismiss}
                  className="w-full mt-3 text-[10px] font-black uppercase tracking-widest text-white/20 hover:text-white/40 transition-colors py-2"
                >
                  Not now
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
