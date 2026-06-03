'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const features = [
  { icon: '💬', title: 'Secure Chat', desc: 'End-to-end encrypted messages, voice notes and custom couple stickers that only you two can see.' },
  { icon: '📸', title: 'Shared Vault', desc: 'Private gallery only the two of you can access. Every photo, every moment, forever safe.' },
  { icon: '🕰️', title: 'Love Timeline', desc: 'From first date to forever, build a living story of your journey together — beautifully displayed.' },
  { icon: '🎉', title: 'Milestones', desc: 'Anniversaries, proposals, first home — celebrate every chapter of your relationship.' },
  { icon: '🔔', title: 'Smart Reminders', desc: 'Thoughtful date prompts and anniversary countdowns so you never miss a special moment.' },
  { icon: '🔒', title: 'Zero Data Mining', desc: 'Your relationship belongs to you — no ads, no tracking, no third parties. Ever.' },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.09, delayChildren: 0.15 } },
}

const itemVariants = {
  hidden: { y: 28, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.52, ease: 'easeOut' } },
}

export default function Features() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.08 })

  return (
    <section ref={ref} id="features" className="py-20 sm:py-28 overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-16">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 mb-5"
          >
            <div className="w-7 h-px bg-[#B8914A]" />
            <span className="text-[11px] tracking-[0.22em] uppercase text-[#E0C080]">only for two</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
            className="font-serif text-[clamp(2rem,7vw,4.2rem)] font-light leading-tight mb-4"
          >
            Designed for <em className="italic text-gradient">intimacy.</em>
            <br />Crafted for connection.
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-sm sm:text-base text-[rgba(248,246,242,0.55)] max-w-[52ch] mx-auto"
          >
            No more scattered memories. JustUs brings your entire relationship into one encrypted sanctuary.
          </motion.p>
        </div>

        {/* Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-[1px] max-w-[1100px] mx-auto rounded-[28px] overflow-hidden"
          style={{ background: 'rgba(201,169,110,0.08)' }}
        >
          {features.map((feat, idx) => (
            <motion.div
              key={idx}
              variants={itemVariants}
              whileHover={{ y: -4 }}
              className="relative p-6 sm:p-8 group overflow-hidden cursor-pointer transition-colors duration-300"
              style={{ background: 'rgba(14,14,12,0.85)' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(24,24,20,0.98)' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(14,14,12,0.85)' }}
            >
              {/* Corner gradient reveal */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{ background: 'radial-gradient(ellipse at 0% 0%, rgba(201,169,110,0.08), transparent 70%)' }}
              />
              {/* Bottom accent */}
              <div
                className="absolute bottom-0 left-0 h-[2px] w-0 group-hover:w-full transition-all duration-500"
                style={{ background: 'linear-gradient(90deg, #C9A96E, #B8914A)' }}
              />

              <span className="text-3xl sm:text-4xl block mb-4" style={{ filter: 'drop-shadow(0 4px 12px rgba(201,169,110,0.35))' }}>
                {feat.icon}
              </span>
              <h3 className="font-serif text-xl sm:text-2xl font-semibold mb-2 text-[#F8F6F2]">
                {feat.title}
              </h3>
              <p className="text-sm text-[rgba(248,246,242,0.5)] leading-relaxed">{feat.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
