'use client'

import { useEffect, useRef } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

export default function CustomCursor() {
  const dotRef = useRef(null)
  const ringRef = useRef(null)

  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  const ringX = useSpring(mouseX, { damping: 18, stiffness: 300 })
  const ringY = useSpring(mouseY, { damping: 18, stiffness: 300 })
  const dotX = useSpring(mouseX, { damping: 30, stiffness: 500 })
  const dotY = useSpring(mouseY, { damping: 30, stiffness: 500 })

  useEffect(() => {
    // Hide on touch devices
    if (window.matchMedia('(hover: none) and (pointer: coarse)').matches) return

    const handleMouseMove = (e) => {
      mouseX.set(e.clientX)
      mouseY.set(e.clientY)
    }
    window.addEventListener('mousemove', handleMouseMove)

    const expand = () => {
      if (!ringRef.current) return
      ringRef.current.style.width = '60px'
      ringRef.current.style.height = '60px'
      ringRef.current.style.borderColor = 'rgba(224,192,128,0.8)'
      ringRef.current.style.background = 'rgba(201,169,110,0.06)'
    }
    const shrink = () => {
      if (!ringRef.current) return
      ringRef.current.style.width = '42px'
      ringRef.current.style.height = '42px'
      ringRef.current.style.borderColor = 'rgba(201,169,110,0.5)'
      ringRef.current.style.background = 'transparent'
    }

    const targets = document.querySelectorAll('a, button, .interactive')
    targets.forEach(el => {
      el.addEventListener('mouseenter', expand)
      el.addEventListener('mouseleave', shrink)
    })

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      targets.forEach(el => {
        el.removeEventListener('mouseenter', expand)
        el.removeEventListener('mouseleave', shrink)
      })
    }
  }, [mouseX, mouseY])

  return (
    <>
      {/* Dot */}
      <motion.div
        ref={dotRef}
        className="fixed w-[7px] h-[7px] bg-[#E0C080] rounded-full pointer-events-none z-[10000] mix-blend-lighten"
        style={{ left: dotX, top: dotY, x: '-50%', y: '-50%' }}
      />
      {/* Ring */}
      <motion.div
        ref={ringRef}
        className="fixed rounded-full pointer-events-none z-[9999] backdrop-blur-[2px] transition-all duration-200"
        style={{
          left: ringX,
          top: ringY,
          x: '-50%',
          y: '-50%',
          width: '42px',
          height: '42px',
          border: '1.5px solid rgba(201,169,110,0.5)',
        }}
      />
    </>
  )
}
