'use client'

import { useRef } from 'react'
import { motion, useInView, useScroll, useTransform } from 'framer-motion'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.14, delayChildren: 0.2 } },
}

const itemVariants = {
  hidden: { y: 32, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.65, ease: 'easeOut' } },
}

const chatMessages = [
  { text: "I can't wait to see you tonight 🌹", me: false },
  { text: 'Same, love — counting minutes 💘', me: true },
  { text: 'our song just played, thinking of you', me: false },
  { text: "🎶 always. you're my home.", me: true },
]

export default function Hero() {
  const sectionRef = useRef(null)
  const isInView = useInView(sectionRef, { once: true, amount: 0.25 })
  const { scrollY } = useScroll()
  const phoneY = useTransform(scrollY, [0, 500], [0, 80])
  const phoneOpacity = useTransform(scrollY, [0, 400], [1, 0.4])

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex items-center pt-24 pb-16 overflow-hidden"
    >
      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-16 grid lg:grid-cols-2 gap-10 lg:gap-16 items-center w-full">

        {/* ── Left ── */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="text-center lg:text-left z-10"
        >
          {/* Eyebrow */}
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[rgba(201,169,110,0.2)] mb-6"
            style={{ background: 'rgba(201,169,110,0.08)' }}
          >
            <span
              className="w-2 h-2 bg-[#C9A96E] rounded-full"
              style={{ animation: 'pulseGlow 2s infinite' }}
            />
            <span className="text-[11px] tracking-[0.2em] uppercase text-[#E0C080]">
              for two souls, only
            </span>
          </motion.div>

          {/* H1 */}
          <motion.h1
            variants={itemVariants}
            className="font-serif text-[clamp(2.8rem,8vw,6.5rem)] font-light leading-[1.06] mb-5"
          >
            <span className="text-gradient">Every heartbeat,</span>
            <br />
            <em className="italic text-gradient">just the two</em>
            <br />
            <span className="text-gradient">of you.</span>
          </motion.h1>

          {/* Sub */}
          <motion.p
            variants={itemVariants}
            className="text-base text-[rgba(248,246,242,0.65)] max-w-[44ch] mx-auto lg:mx-0 mb-8 leading-relaxed"
          >
            A private universe for your love — encrypted chat, memory vault, shared timeline.
            Built for intimacy, not algorithms.
          </motion.p>

          {/* Buttons */}
          <motion.div variants={itemVariants} className="flex flex-wrap gap-4 justify-center lg:justify-start mb-6">
            <motion.a
              href="#download"
              whileHover={{ scale: 1.04, y: -3 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-2 text-[#0C0C0E] px-7 py-3.5 rounded-full font-medium text-sm"
              style={{
                background: 'linear-gradient(115deg, #C9A96E, #8A6835)',
                boxShadow: '0 12px 32px rgba(201,169,110,0.3), inset 0 1px 0 rgba(255,255,255,0.15)',
              }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
              </svg>
              Download Free APK
            </motion.a>

            <motion.a
              href="#features"
              whileHover={{ x: 4 }}
              className="inline-flex items-center gap-1 text-sm text-[rgba(248,246,242,0.55)] border-b border-[rgba(248,246,242,0.25)] pb-0.5 hover:text-white hover:border-white transition-colors self-center"
            >
              Explore features →
            </motion.a>
          </motion.div>

          {/* Trust row */}
          <motion.div
            variants={itemVariants}
            className="flex flex-wrap gap-5 justify-center lg:justify-start text-[11px] uppercase tracking-widest text-[rgba(248,246,242,0.38)]"
          >
            {['e2e encrypted', 'android apk', '100% ad‑free'].map((t) => (
              <span key={t} className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-[#C9A96E] rounded-full opacity-70" />
                {t}
              </span>
            ))}
          </motion.div>
        </motion.div>

        {/* ── Right — Phone ── */}
        <motion.div
          style={{ y: phoneY, opacity: phoneOpacity }}
          initial={{ opacity: 0, scale: 0.88, rotateY: -12 }}
          animate={{ opacity: 1, scale: 1, rotateY: 0 }}
          transition={{ duration: 0.9, delay: 0.3, ease: 'easeOut' }}
          className="relative flex justify-center"
        >
          <div className="relative" style={{ animation: 'floatGlide 7s ease-in-out infinite' }}>
            {/* Glow */}
            <div
              className="absolute inset-[-30px] rounded-full blur-2xl"
              style={{
                background: 'radial-gradient(ellipse, rgba(201,169,110,0.35), rgba(184,145,74,0) 72%)',
                animation: 'softPulse 4s infinite alternate',
              }}
            />

            {/* Phone frame */}
            <div
              className="relative w-[220px] sm:w-[255px] rounded-[50px] p-[14px] z-10"
              style={{
                height: 'clamp(440px, 90vw, 510px)',
                background: 'linear-gradient(155deg, #252520, #0C0C0E)',
                border: '1px solid rgba(201,169,110,0.25)',
                boxShadow: '0 40px 80px rgba(0,0,0,0.7), inset 0 0 0 1px rgba(255,255,255,0.04)',
              }}
            >
              <div
                className="w-full h-full flex flex-col p-3 gap-1.5 overflow-hidden"
                style={{
                  background: 'radial-gradient(ellipse at 30% 20%, #1E1E1A, #0A0A0C)',
                  borderRadius: '38px',
                }}
              >
                {/* Status */}
                <div className="flex justify-between text-[7px] text-[rgba(248,246,242,0.6)] px-1 pt-0.5">
                  <span>9:41</span><span>🔒</span>
                </div>

                {/* Header */}
                <div className="flex flex-col items-center gap-0.5 pb-1">
                  <span className="font-serif text-[13px] font-semibold text-[#F8F6F2]">JustUs</span>
                  <span className="text-[5.5px] text-[#EDD9B4]">✨ Maya + Rohan · 189 days together</span>
                </div>

                <div className="h-px" style={{ background: 'linear-gradient(90deg,transparent,rgba(201,169,110,0.3),transparent)' }} />

                {/* Chat */}
                <div className="flex flex-col gap-1.5 flex-1 py-1">
                  {chatMessages.map((msg, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: msg.me ? 8 : -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.7 + i * 0.18, duration: 0.35 }}
                      className={`text-[7px] px-2.5 py-1.5 max-w-[80%] text-[rgba(248,246,242,0.9)] ${
                        msg.me
                          ? 'self-end rounded-xl rounded-br-[4px]'
                          : 'self-start rounded-xl rounded-bl-[4px] bg-[rgba(30,30,26,0.9)]'
                      }`}
                      style={msg.me ? {
                        background: 'linear-gradient(135deg,rgba(201,169,110,0.55),rgba(168,134,90,0.6))',
                      } : {}}
                    >
                      {msg.text}
                    </motion.div>
                  ))}
                </div>

                {/* Memory row */}
                <div className="flex gap-1.5 mt-1">
                  {['first meet', 'nyc trip', 'promise'].map((label) => (
                    <div
                      key={label}
                      className="flex-1 h-[48px] rounded-lg flex items-end pb-1 px-1 text-[4.5px] text-[rgba(248,246,242,0.6)]"
                      style={{
                        background: 'linear-gradient(135deg,rgba(40,38,30,0.9),rgba(20,20,18,0.8))',
                        border: '1px solid rgba(201,169,110,0.2)',
                      }}
                    >
                      {label}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Floating pills */}
            {[
              { className: 'absolute -top-6 -right-12 sm:top-0 sm:-right-14', label: '💌 private notes', delay: 0.6 },
              { className: 'absolute bottom-24 -left-10 sm:bottom-28 sm:-left-14', label: '📖 love timeline', delay: 0.8 },
              { className: 'absolute -bottom-4 right-0 sm:-right-12', label: '🎀 milestones', delay: 1.0 },
            ].map((pill) => (
              <motion.div
                key={pill.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: pill.delay, duration: 0.4 }}
                className={`${pill.className} bg-[rgba(14,14,14,0.92)] backdrop-blur-lg rounded-full px-3 py-1.5 text-xs whitespace-nowrap shadow-xl hidden sm:block`}
                style={{ border: '1px solid rgba(201,169,110,0.25)', animation: 'pillFloat 6s ease-in-out infinite' }}
              >
                {pill.label}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      <style jsx>{`
        @keyframes softPulse {
          0% { opacity: 0.5; transform: scale(0.92); }
          100% { opacity: 1; transform: scale(1.08); }
        }
        @keyframes floatGlide {
          0%, 100% { transform: translateY(0px) rotate(-1.2deg); }
          50% { transform: translateY(-14px) rotate(-0.4deg); }
        }
        @keyframes pillFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        @keyframes pulseGlow {
          0%, 100% { opacity: 0.5; transform: scale(1); box-shadow: 0 0 0 transparent; }
          50% { opacity: 1; transform: scale(1.25); box-shadow: 0 0 8px #C9A96E; }
        }
      `}</style>
    </section>
  )
}
