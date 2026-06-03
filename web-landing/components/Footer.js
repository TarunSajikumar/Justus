'use client'

import { motion } from 'framer-motion'

export default function Footer() {
  return (
    <footer
      className="py-6 sm:py-8 px-4 sm:px-8 lg:px-16 flex flex-col sm:flex-row justify-between items-center gap-4 flex-wrap"
      style={{
        borderTop: '1px solid rgba(201,169,110,0.1)',
        background: 'rgba(10,10,12,0.6)',
      }}
    >
      <div className="font-serif text-xl sm:text-2xl font-semibold text-gradient">
        Just<em className="not-italic">Us</em>
      </div>

      <p className="text-[10px] sm:text-xs text-[rgba(248,246,242,0.3)]">
        © 2025 JustUs · crafted with devotion for couples worldwide.
      </p>

      <div className="flex gap-5 sm:gap-7">
        {['Privacy', 'Terms', 'Support'].map((link) => (
          <motion.a
            key={link}
            href="#"
            whileHover={{ color: '#EDD9B4' }}
            className="text-[10px] sm:text-xs text-[rgba(248,246,242,0.3)] transition-colors"
          >
            {link}
          </motion.a>
        ))}
      </div>
    </footer>
  )
}
