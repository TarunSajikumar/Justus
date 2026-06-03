'use client'

import { useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'

const installSteps = [
  { num: 1, text: 'Save file', sub: 'tap download → APK saved' },
  { num: 2, text: 'Allow install', sub: 'settings → security → unknown sources' },
  { num: 3, text: 'Open APK', sub: 'tap from notification or files' },
  { num: 4, text: 'Invite partner', sub: 'share code & begin' },
]

export default function Download() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.25 })
  const [isDownloading, setIsDownloading] = useState(false)
  const [downloaded, setDownloaded] = useState(false)

  const handleDownload = () => {
    if (isDownloading) return
    setIsDownloading(true)
    const link = document.createElement('a')
    link.href = '/justus.apk'
    link.download = 'justus.apk'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    setTimeout(() => { setIsDownloading(false); setDownloaded(true) }, 2000)
    setTimeout(() => setDownloaded(false), 5000)
  }

  return (
    <section ref={ref} id="download" className="relative py-20 sm:py-28 overflow-hidden text-center">
      {/* Background glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(201,169,110,0.1), transparent 70%)',
          filter: 'blur(80px)',
          animation: 'rotateGlow 14s infinite alternate',
        }}
      />

      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-16 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 mb-5"
        >
          <div className="w-7 h-px bg-[#B8914A]" />
          <span className="text-[11px] tracking-[0.22em] uppercase text-[#E0C080]">the app</span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-serif text-[clamp(2rem,7vw,4.2rem)] font-light leading-tight mb-4"
        >
          Ready for{' '}
          <em className="italic text-gradient">just the two of you?</em>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-sm sm:text-base text-[rgba(248,246,242,0.55)] max-w-md mx-auto mb-10"
        >
          Free, encrypted, yours. Download JustUs APK directly — no middlemen, no subscriptions.
        </motion.p>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.96 }}
          animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
          transition={{ duration: 0.65, delay: 0.25 }}
          className="max-w-[500px] mx-auto glass-card rounded-[48px] p-7 sm:p-12 relative z-10"
          style={{ boxShadow: '0 0 80px rgba(201,169,110,0.08)' }}
        >
          <span className="text-5xl block mb-3" style={{ filter: 'drop-shadow(0 4px 16px rgba(201,169,110,0.4))' }}>
            📱💞
          </span>
          <h3 className="font-serif text-2xl sm:text-3xl font-semibold text-[#F8F6F2] mb-1">
            JustUs for Android
          </h3>
          <p className="text-xs text-[rgba(248,246,242,0.4)] tracking-wide mb-6">
            APK · Android 7+ · ~19 MB · always free
          </p>

          <motion.button
            onClick={handleDownload}
            whileHover={{ scale: 1.03, y: -3 }}
            whileTap={{ scale: 0.97 }}
            disabled={isDownloading}
            className="inline-flex items-center gap-2 text-[#0C0C0E] px-8 py-4 rounded-full font-semibold text-sm transition-all disabled:opacity-70"
            style={{
              background: 'linear-gradient(110deg, #C9A96E, #8A6835)',
              boxShadow: '0 8px 24px rgba(201,169,110,0.35)',
              animation: 'btnPulse 2.4s infinite',
            }}
          >
            {isDownloading ? (
              <>
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Starting download...
              </>
            ) : downloaded ? (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <polyline points="20 6 9 17 4 12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Download started ✓
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
                </svg>
                Download JustUs APK
              </>
            )}
          </motion.button>

          <p className="text-[10px] text-[rgba(248,246,242,0.3)] mt-4 tracking-wide">
            🔐 signed &amp; safe — from us, with love
          </p>
        </motion.div>

        {/* Install guide */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-wrap justify-center gap-3 sm:gap-4 mt-8"
        >
          {installSteps.map((step) => (
            <div
              key={step.num}
              className="flex items-center gap-2 rounded-full px-3 py-2 sm:px-4 sm:py-2.5"
              style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(201,169,110,0.12)',
              }}
            >
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold text-[#0C0C0E] flex-shrink-0"
                style={{ background: '#C9A96E' }}
              >
                {step.num}
              </div>
              <div className="text-left">
                <div className="text-xs font-medium text-[#F8F6F2]">{step.text}</div>
                <div className="text-[10px] text-[rgba(248,246,242,0.35)]">{step.sub}</div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      <style jsx>{`
        @keyframes rotateGlow {
          0% { opacity: 0.4; transform: translate(-50%, -50%) scale(1); }
          100% { opacity: 0.85; transform: translate(-50%, -50%) scale(1.2); }
        }
        @keyframes btnPulse {
          0% { box-shadow: 0 8px 24px rgba(201,169,110,0.35), 0 0 0 0 rgba(201,169,110,0.35); }
          70% { box-shadow: 0 8px 24px rgba(201,169,110,0.35), 0 0 0 16px rgba(201,169,110,0); }
          100% { box-shadow: 0 8px 24px rgba(201,169,110,0.35), 0 0 0 0 rgba(201,169,110,0); }
        }
      `}</style>
    </section>
  )
}
