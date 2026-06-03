'use client'

import { useState, useEffect } from 'react'
import { motion, useScroll, useMotionValueEvent } from 'framer-motion'

const navVariants = {
  hidden: { y: -80, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.6, ease: 'easeOut' } },
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const { scrollY } = useScroll()

  useMotionValueEvent(scrollY, 'change', (latest) => {
    setScrolled(latest > 50)
  })

  return (
    <motion.nav
      initial="hidden"
      animate="visible"
      variants={navVariants}
      className={`fixed top-0 left-0 right-0 z-[500] transition-all duration-300 ${
        scrolled ? 'py-2.5' : 'py-4'
      }`}
      style={{
        background: scrolled ? 'rgba(8,8,10,0.95)' : 'rgba(12,12,14,0.75)',
        backdropFilter: 'blur(28px) saturate(200%)',
        borderBottom: '1px solid rgba(201,169,110,0.18)',
      }}
    >
      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-16 flex justify-between items-center">
        {/* Logo */}
        <motion.div
          whileHover={{ scale: 1.03 }}
          className="font-serif text-2xl sm:text-3xl font-semibold text-gradient"
        >
          JustUs
        </motion.div>

        {/* Center pill */}
        <div className="hidden md:flex items-center">
          <div
            className="text-[11px] tracking-[0.15em] uppercase text-[#EDD9B4] border border-[rgba(201,169,110,0.35)] px-4 py-2 rounded-full backdrop-blur-sm"
            style={{ background: 'rgba(201,169,110,0.08)', animation: 'pillGlow 3s infinite alternate' }}
          >
            ✧ encrypted for two ✧
          </div>
        </div>

        {/* CTA */}
        <motion.a
          href="#download"
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.97 }}
          className="bg-gradient-to-r from-[#C9A96E] to-[#A8865A] text-[#0C0C0E] px-4 py-2 sm:px-5 sm:py-2.5 rounded-full text-xs sm:text-sm font-semibold uppercase tracking-wide shadow-lg"
          style={{ boxShadow: '0 6px 20px rgba(201,169,110,0.25)' }}
        >
          Get APK
        </motion.a>
      </div>
    </motion.nav>
  )
}
