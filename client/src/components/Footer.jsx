import { Link } from 'react-router-dom'
import { ChevronUp, Instagram, Twitter, Facebook } from 'lucide-react'

export default function Footer() {
   const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

   return (
      <footer className="bg-[#111112] text-white/70 border-t border-white/5">
         {/* Back to top */}
         <button
            onClick={scrollToTop}
            className="w-full py-4 bg-[#1a1a1c] hover:bg-[#252527] transition-colors flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest text-white/50 hover:text-white"
         >
            <ChevronUp className="w-4 h-4" /> Back to top
         </button>

         {/* Newsletter */}
         <div className="border-t border-white/5 bg-black/20">
            <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row items-center justify-between gap-8">
               <div className="max-w-md">
                  <h3 className="text-white font-outfit font-black text-2xl uppercase tracking-tighter mb-2">Join the RYZE Club</h3>
                  <p className="text-white/40 text-sm font-medium leading-relaxed">Sign up for early access to drops, exclusive luxury offers, and the latest in premium tech.</p>
               </div>
               <div className="flex w-full md:w-auto gap-2">
                  <input
                     type="email"
                     placeholder="you@ryze.store"
                     className="flex-1 md:w-80 bg-white/5 border border-white/10 rounded-xl px-6 py-4 text-sm focus:outline-none focus:border-[#c9a962]/40 text-white"
                  />
                  <button className="bg-[#c9a962] text-black font-black px-8 py-4 rounded-xl text-xs uppercase tracking-widest hover:bg-[#b09452] transition-all whitespace-nowrap">
                     Subscribe
                  </button>
               </div>
            </div>
         </div>

         <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
            <div className="flex flex-col gap-6">
               <div className="font-outfit font-black text-2xl text-white">
                  RY<span className="text-[#c9a962]">ZE</span>
               </div>
               <p className="text-sm leading-relaxed text-white/40 font-medium">The pinnacle of luxury shopping. Curated electronics, fashion, and home essentials delivered with ryze precision.</p>
               <div className="flex gap-4">
                  {[
                     { id: 'ig', icon: <Instagram className="w-4 h-4" /> },
                     { id: 'tw', icon: <Twitter className="w-4 h-4" /> },
                     { id: 'fb', icon: <Facebook className="w-4 h-4" /> }
                  ].map(social => (
                     <div key={social.id} className="w-10 h-10 rounded-full glass flex items-center justify-center hover:bg-[#c9a962] hover:text-black transition-all cursor-pointer">
                        {social.icon}
                     </div>
                  ))}
               </div>
            </div>

            <div>
               <h4 className="text-white font-outfit font-black text-xs uppercase tracking-[0.2em] mb-8">Get to Know Us</h4>
               <ul className="flex flex-col gap-4 text-sm font-medium text-white/40">
                  <li><Link to="/shop" className="hover:text-[#c9a962] transition-all">About RYZE</Link></li>
                  <li><Link to="/shop" className="hover:text-[#c9a962] transition-all">Careers</Link></li>
                  <li><Link to="/shop" className="hover:text-[#c9a962] transition-all">Press Releases</Link></li>
                  <li><Link to="/shop" className="hover:text-[#c9a962] transition-all">RYZE Science</Link></li>
               </ul>
            </div>

            <div>
               <h4 className="text-white font-outfit font-black text-xs uppercase tracking-[0.2em] mb-8">Connect with Us</h4>
               <ul className="flex flex-col gap-4 text-sm font-medium text-white/40">
                  <li><a href="https://facebook.com" target="_blank" rel="noreferrer" className="hover:text-[#c9a962] transition-all">Facebook</a></li>
                  <li><a href="https://twitter.com" target="_blank" rel="noreferrer" className="hover:text-[#c9a962] transition-all">Twitter</a></li>
                  <li><a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:text-[#c9a962] transition-all">Instagram</a></li>
               </ul>
            </div>

            <div>
               <h4 className="text-white font-outfit font-black text-xs uppercase tracking-[0.2em] mb-8">Let Us Help You</h4>
               <ul className="flex flex-col gap-4 text-sm font-medium text-white/40">
                  <li><Link to="/shop" className="hover:text-[#c9a962] transition-all">Your Account</Link></li>
                  <li><Link to="/shop" className="hover:text-[#c9a962] transition-all">Returns Centre</Link></li>
                  <li><Link to="/shop" className="hover:text-[#c9a962] transition-all">100% Protection</Link></li>
                  <li><Link to="/shop" className="hover:text-[#c9a962] transition-all">RYZE App</Link></li>
                  <li><Link to="/shop" className="hover:text-[#c9a962] transition-all">Help Center</Link></li>
               </ul>
            </div>
         </div>

         <div className="border-t border-white/5 py-12 bg-black/40">
            <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8">
               <div className="flex gap-8 text-[10px] uppercase font-black tracking-[0.2em] text-white/30">
                  <Link to="/shop" className="hover:text-white transition-colors">Conditions of Use</Link>
                  <Link to="/shop" className="hover:text-white transition-colors">Privacy Notice</Link>
                  <Link to="/shop" className="hover:text-white transition-colors">RYZE Ads</Link>
               </div>
               <p className="text-[10px] text-white/10 tracking-[0.1em] uppercase font-bold text-center md:text-right">
                  © 2024–2026, RYZE, Inc. — Precision Built by Muhammad Hasan
               </p>
            </div>
         </div>
      </footer>
   )
}
