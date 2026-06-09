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

         <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
            <div className="flex flex-col gap-6">
               <div className="font-outfit font-black text-2xl text-white">
                  RY<span className="text-[#c9a962]">ZE</span>
               </div>
               <p className="text-sm leading-relaxed text-white/40 font-medium">Everyday electronics, fashion, and home essentials — chosen with care and delivered to your door.</p>
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
