'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'

export default function ThreeBackground({ mousePosition }) {
  const containerRef = useRef(null)
  const stateRef = useRef({
    scene: null, camera: null, renderer: null,
    particles: null, orbs: [], animId: null,
    mouseX: 0, mouseY: 0,
  })

  useEffect(() => {
    if (!containerRef.current) return
    const S = stateRef.current

    // Scene
    S.scene = new THREE.Scene()

    // Camera
    S.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
    S.camera.position.z = 30

    // Renderer — transparent so CSS background shows
    S.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
    S.renderer.setSize(window.innerWidth, window.innerHeight)
    S.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    S.renderer.setClearColor(0x000000, 0)
    containerRef.current.appendChild(S.renderer.domElement)

    // Particles
    const particleCount = 600
    const geo = new THREE.BufferGeometry()
    const positions = new Float32Array(particleCount * 3)
    const colors = new Float32Array(particleCount * 3)
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3]     = (Math.random() - 0.5) * 100
      positions[i * 3 + 1] = (Math.random() - 0.5) * 60
      positions[i * 3 + 2] = (Math.random() - 0.5) * 50 - 20
      const c = new THREE.Color().setHSL(0.10 + Math.random() * 0.06, 0.75, 0.58)
      colors[i * 3] = c.r; colors[i * 3 + 1] = c.g; colors[i * 3 + 2] = c.b
    }
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    const mat = new THREE.PointsMaterial({
      size: 0.14, vertexColors: true,
      transparent: true, opacity: 0.45,
      blending: THREE.AdditiveBlending, depthWrite: false,
    })
    S.particles = new THREE.Points(geo, mat)
    S.scene.add(S.particles)

    // Orbs
    for (let i = 0; i < 7; i++) {
      const size = Math.random() * 1.4 + 0.6
      const orbGeo = new THREE.SphereGeometry(size, 24, 24)
      const orbMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color().setHSL(0.10 + Math.random() * 0.06, 0.7, 0.5),
        emissive: new THREE.Color().setHSL(0.10, 0.7, 0.18),
        emissiveIntensity: 0.35,
        transparent: true, opacity: 0.35,
        roughness: 0.3, metalness: 0.75,
      })
      const orb = new THREE.Mesh(orbGeo, orbMat)
      orb.userData = {
        sx: (Math.random() - 0.5) * 0.005,
        sy: (Math.random() - 0.5) * 0.005,
        sz: (Math.random() - 0.5) * 0.003,
        phase: Math.random() * Math.PI * 2,
      }
      orb.position.set(
        (Math.random() - 0.5) * 30,
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 20 - 10,
      )
      S.scene.add(orb)
      S.orbs.push(orb)
    }

    // Lights
    S.scene.add(new THREE.AmbientLight(0x404040, 0.6))
    const dLight = new THREE.DirectionalLight(0xffffff, 1)
    dLight.position.set(5, 10, 7)
    S.scene.add(dLight)
    const pLight = new THREE.PointLight(0xC9A96E, 0.5)
    pLight.position.set(-3, 0, -5)
    S.scene.add(pLight)

    // Animation
    let time = 0
    function animate() {
      S.animId = requestAnimationFrame(animate)
      time += 0.004

      if (S.particles) {
        S.particles.rotation.y = time * 0.04
        S.particles.rotation.x = Math.sin(time * 0.08) * 0.08
      }

      S.orbs.forEach((orb, idx) => {
        const d = orb.userData
        orb.position.x += d.sx + Math.sin(time * 0.45 + idx + d.phase) * 0.002
        orb.position.y += d.sy + Math.cos(time * 0.35 + idx + d.phase) * 0.002
        orb.position.z += d.sz
        if (Math.abs(orb.position.x) > 25) d.sx *= -1
        if (Math.abs(orb.position.y) > 18) d.sy *= -1
        if (Math.abs(orb.position.z) > 22) d.sz *= -1
        orb.rotation.x += 0.008
        orb.rotation.y += 0.012
      })

      // Camera follow mouse (smooth)
      if (S.mousePosition) {
        S.mouseX += ((S.mousePosition.x / window.innerWidth - 0.5) * 0.02 - S.mouseX) * 0.08
        S.mouseY += ((S.mousePosition.y / window.innerHeight - 0.5) * 0.015 - S.mouseY) * 0.08
      }
      S.camera.position.x += (S.mouseX * 2 - S.camera.position.x) * 0.04
      S.camera.position.y += (-S.mouseY * 1.5 - S.camera.position.y) * 0.04
      S.camera.lookAt(S.scene.position)

      S.renderer.render(S.scene, S.camera)
    }
    animate()

    const handleResize = () => {
      S.camera.aspect = window.innerWidth / window.innerHeight
      S.camera.updateProjectionMatrix()
      S.renderer.setSize(window.innerWidth, window.innerHeight)
    }
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      cancelAnimationFrame(S.animId)
      if (containerRef.current && S.renderer) {
        try { containerRef.current.removeChild(S.renderer.domElement) } catch {}
      }
      geo.dispose(); mat.dispose()
      S.orbs.forEach(o => { o.geometry.dispose(); o.material.dispose() })
    }
  }, [])

  // Update mouse position ref
  useEffect(() => {
    stateRef.current.mousePosition = mousePosition
  }, [mousePosition])

  return <div ref={containerRef} className="fixed inset-0 pointer-events-none z-0" />
}
