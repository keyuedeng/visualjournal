"use client"
import { useState, useEffect } from 'react'
import Link from 'next/link'
import DemoGraph from '@/components/DemoGraph'

export default function Home() {
  const [displayedText, setDisplayedText] = useState('')
  const [showCursor, setShowCursor] = useState(true)
  const fullText = 'See what defines you'

  useEffect(() => {
    let currentIndex = 0
    const typingInterval = setInterval(() => {
      if (currentIndex <= fullText.length) {
        setDisplayedText(fullText.slice(0, currentIndex))
        currentIndex++
      } else {
        clearInterval(typingInterval)
        setShowCursor(false)
      }
    }, 60)

    return () => clearInterval(typingInterval)
  }, [])

  useEffect(() => {
    if (displayedText.length === fullText.length) return
    
    const cursorInterval = setInterval(() => {
      setShowCursor((prev) => !prev)
    }, 530)

    return () => clearInterval(cursorInterval)
  }, [displayedText])

  return (
    <div className="bg-gradient-to-br from-stone-100/50 via-slate-50/40 to-neutral-100/50">
      <header className="py-8 px-8 text-2xl font-bold tracking-wide text-slate-700 font-serif">Moiré</header>
      <section id = "hero" className=" min-h-screen flex items-center min-h-[calc(100vh-80px)] px-8 md:px-16 lg:px-24">
        <div className="max-w-2xl flex-shrink-0">
          <h1 className="mb-6 text-5xl md:text-6xl lg:text-7xl font-light leading-tight text-slate-700 tracking-tight font-serif">
            {displayedText}
            {showCursor && <span className="text-blue-400/40" style={{ fontWeight: 100 }}>|</span>}
            {!showCursor && displayedText.length === fullText.length && <span className="text-blue-400/60">.</span>}
          </h1>
          <p className="mb-10 text-lg md:text-xl text-slate-600 leading-relaxed font-light max-w-xl">
            Turn your thoughts into insight. <span className="text-[#b88998] italic">Discover</span> recurring themes and intentions, and notice what shapes <span className="text-[#b88998] italic">you</span> over time.
          </p>
          <div className="flex gap-4 flex-wrap">
            <Link 
              href="/sign-up" 
              className="px-10 py-3.5 text-sm font-medium bg-slate-600 text-white rounded-full hover:bg-slate-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
            >
              Get Started →
            </Link>
            <Link 
              href="/sign-in" 
              className="px-10 py-3.5 text-sm font-medium bg-white/80 backdrop-blur-sm text-slate-700 rounded-full hover:bg-white transition-all duration-300 shadow-md hover:shadow-lg"
            >
              Sign In
            </Link>
          </div>
        </div>
        <div className="flex-1 h-[700px] ml-16 hidden lg:block -mt-30">
          <DemoGraph />
        </div>
      </section>
      <section id="how it works" className="min-h-screen bg-white flex items-center justify-center px-8">
        <div className="max-w-6xl w-full">
          <h2 className="text-4xl md:text-5xl font-light text-center mb-16 text-slate-700 font-serif">
            From writing to insight
          </h2>
          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <h3 className="text-xl font-light mb-4 text-slate-700 font-medium">📝 Write freely</h3>
              <p className="text-slate-600 leading-relaxed">Capture thoughts, reflections, and moments — no prompts, no pressure.</p>
            </div>
            <div className="text-center">
              <h3 className="text-xl font-light mb-4 text-slate-700 font-medium">💡 See connections emerge</h3>
              <p className="text-slate-600 leading-relaxed">Recurring themes, intentions, and ideas surface naturally as you write.</p>
            </div>
            <div className="text-center">
              <h3 className="text-xl font-light mb-4 text-slate-700 font-medium">🌱 Understand yourself over time</h3>
              <p className="text-slate-600 leading-relaxed">Recurring themes, intentions, and ideas surface naturally as you write.</p>
            </div>
          </div>
        </div>
      </section>
      <section id="features" className="min-h-screen bg-gradient-to-br from-stone-100/50 via-slate-50/40 to-neutral-100/50 flex justify-center items-center">
        <div>
          <h2 className="text-4xl md:text-5xl font-light text-center mb-16 text-slate-700 font-serif">
            What you'll notice
          </h2>
        </div>
      </section>
    </div>
  )
}
