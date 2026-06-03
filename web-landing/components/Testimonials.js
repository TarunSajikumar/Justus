'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const testimonials = [
  { stars: 5, quote: "JustUs is the only app where I feel truly private. No ads. No algorithms reading our messages. Just us.", name: "Priya & Arjun", sub: "Together 3 years", emoji: "🌸" },
  { stars: 5, quote: "The love timeline feature made me cry happy tears. Seeing our whole journey in one place is magical.", name: "Sofia & Marco", sub: "Together 5 years", emoji: "🌹" },
  { stars: 5, quote: "We use the memory vault every single day. It's become our most cherished digital space.", name: "Layla & Hassan", sub: "Together 2 years", emoji: "💫" },
  { stars: 5, quote: "Finally! An app that respects our privacy. E2E encryption that actually means something.", name: "Emma & Liam", sub: "Engaged 🤍", emoji: "💍" },
  { stars: 5, quote: "The milestones feature is perfect for anniversary planning. We've logged 47 special moments.", name: "Yuki & Kenji", sub: "Together 4 years", emoji: "🌷" },
  { stars: 5, quote: "It replaced like 5 other apps we were using. Everything in one beautiful, private place.", name: "Amara & David", sub: "Together 1.5 years", emoji: "✨" },
  { stars: 5, quote: "The floating love timeline view is just gorgeous. This app was made with real love.", name: "Camille & Antoine", sub: "Together 6 years", emoji: "🎀" },
]

// Duplicate for seamless infinite scroll via CSS animation
const doubled = [...testimonials, ...testimonials]

export default function Testimonials() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.2 })

  return (
    <section ref={ref} id="testimonials" className="py-20 sm:py-28 overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-16 mb-12">
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 mb-5"
          >
            <div className="w-7 h-px bg-[#B8914A]" />
            <span className="text-[11px] tracking-[0.22em] uppercase text-[#E0C080]">from real couples</span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
            className="font-serif text-[clamp(2rem,7vw,4.2rem)] font-light leading-tight"
          >
            Love stories,{' '}
            <em className="italic text-gradient">shared.</em>
          </motion.h2>
        </div>
      </div>

      {/* Carousel */}
      <div className="relative">
        {/* Edge fades */}
        <div
          className="absolute left-0 top-0 bottom-0 w-20 pointer-events-none z-10"
          style={{ background: 'linear-gradient(to right, #0C0C0E, transparent)' }}
        />
        <div
          className="absolute right-0 top-0 bottom-0 w-20 pointer-events-none z-10"
          style={{ background: 'linear-gradient(to left, #0C0C0E, transparent)' }}
        />

        {/* Scrolling track */}
        <div
          className="flex gap-4 pb-4"
          style={{ animation: isInView ? 'scrollTrack 36s linear infinite' : 'none', width: 'max-content' }}
          onMouseEnter={(e) => { e.currentTarget.style.animationPlayState = 'paused' }}
          onMouseLeave={(e) => { e.currentTarget.style.animationPlayState = 'running' }}
        >
          {doubled.map((t, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -4, scale: 1.02 }}
              className="flex-shrink-0 w-[280px] sm:w-[300px] p-5 rounded-2xl transition-all duration-300"
              style={{
                background: 'rgba(18,18,16,0.9)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(201,169,110,0.15)',
              }}
            >
              <div className="text-[#F5C542] text-sm mb-3">{'★'.repeat(t.stars)}</div>
              <p className="text-sm text-[rgba(248,246,242,0.7)] italic mb-4 leading-relaxed">"{t.quote}"</p>
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-base flex-shrink-0"
                  style={{
                    background: 'linear-gradient(135deg,rgba(201,169,110,0.25),rgba(60,50,20,0.5))',
                    border: '1px solid rgba(201,169,110,0.3)',
                  }}
                >
                  {t.emoji}
                </div>
                <div>
                  <div className="text-sm font-medium text-[#F8F6F2]">{t.name}</div>
                  <div className="text-[11px] text-[rgba(248,246,242,0.38)]">{t.sub}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes scrollTrack {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </section>
  )
}
