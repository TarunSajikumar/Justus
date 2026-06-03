'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const steps = [
  { num: '01', title: 'Download APK', desc: 'Tap the button below and save the file directly to your Android device.' },
  { num: '02', title: 'Install & Create', desc: 'Enable "unknown sources" if needed — takes about 10 seconds to install.' },
  { num: '03', title: 'Invite Your Partner', desc: 'Share your unique invite code — your private space comes alive instantly.' },
]

export default function HowItWorks() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.2 })

  return (
    <section
      ref={ref}
      id="how"
      className="py-20 sm:py-28"
      style={{ background: 'linear-gradient(to bottom, rgba(201,169,110,0.02), transparent)' }}
    >
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
            <span className="text-[11px] tracking-[0.22em] uppercase text-[#E0C080]">get started</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
            className="font-serif text-[clamp(2rem,7vw,4.2rem)] font-light leading-tight mb-4"
          >
            Three steps to{' '}
            <em className="italic text-gradient">your world.</em>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-sm sm:text-base text-[rgba(248,246,242,0.55)] max-w-md mx-auto"
          >
            Direct APK install. No Play Store required — just love.
          </motion.p>
        </div>

        {/* Steps */}
        <div className="grid sm:grid-cols-3 gap-10 md:gap-14 max-w-4xl mx-auto text-center relative">
          {/* Connector line */}
          <div
            className="absolute top-[35px] left-[18%] right-[18%] h-px hidden sm:block pointer-events-none"
            style={{ background: 'linear-gradient(to right, transparent, rgba(201,169,110,0.3), transparent)' }}
          />

          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.88 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: i * 0.15, duration: 0.5, ease: 'easeOut' }}
              whileHover={{ y: -8 }}
              className="relative z-10"
            >
              <motion.div
                whileHover={{ scale: 1.1, boxShadow: '0 0 40px rgba(201,169,110,0.3)' }}
                className="w-[68px] h-[68px] mx-auto mb-5 rounded-full flex items-center justify-center font-serif text-xl font-semibold text-[#EDD9B4] transition-all duration-300"
                style={{
                  background: 'linear-gradient(135deg,rgba(201,169,110,0.15),rgba(60,52,30,0.4))',
                  border: '1px solid rgba(201,169,110,0.35)',
                  boxShadow: '0 0 30px rgba(201,169,110,0.1)',
                }}
              >
                {step.num}
              </motion.div>
              <h3 className="font-serif text-lg sm:text-xl font-semibold text-[#F8F6F2] mb-2">{step.title}</h3>
              <p className="text-sm text-[rgba(248,246,242,0.45)] leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
