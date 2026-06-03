'use client'

import { useRef, useState, useEffect } from 'react'
import { motion, useInView } from 'framer-motion'
import CountUp from 'react-countup'

const stats = [
  { value: 12, suffix: 'K+', label: 'couples', duration: 2, isNumber: true },
  { value: 4.95, suffix: '★', label: 'loved by users', duration: 2.5, isNumber: true, decimals: 2 },
  { value: 100, suffix: '%', label: 'private', duration: 1.8, isNumber: true },
  { value: '∞', suffix: '', label: 'forever free', isNumber: false },
]

function StatItem({ stat }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.6 })

  return (
    <div ref={ref} className="text-center">
      <div className="font-serif text-[clamp(1.8rem,6vw,2.8rem)] font-light text-gradient-gold leading-none">
        {stat.isNumber && isInView ? (
          <CountUp
            end={stat.value}
            duration={stat.duration}
            decimals={stat.decimals || 0}
            suffix={stat.suffix}
          />
        ) : (
          `${stat.isNumber ? '0' : stat.value}${stat.suffix}`
        )}
      </div>
      <div className="text-[10px] tracking-[0.18em] uppercase text-[rgba(248,246,242,0.4)] mt-1.5">
        {stat.label}
      </div>
    </div>
  )
}

export default function StatsBar() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
      className="relative z-10 flex flex-wrap justify-center gap-8 sm:gap-12 md:gap-16 py-8 sm:py-10 px-4"
      style={{
        borderTop: '1px solid rgba(201,169,110,0.12)',
        borderBottom: '1px solid rgba(201,169,110,0.12)',
        background: 'rgba(12,12,14,0.6)',
        backdropFilter: 'blur(12px)',
      }}
    >
      {stats.map((stat, i) => (
        <div key={i} className="flex items-center gap-8 sm:gap-12 md:gap-16">
          <StatItem stat={stat} />
          {i < stats.length - 1 && (
            <div
              className="hidden sm:block w-px h-10 self-center"
              style={{ background: 'linear-gradient(to bottom, transparent, rgba(201,169,110,0.35), transparent)' }}
            />
          )}
        </div>
      ))}
    </motion.div>
  )
}
