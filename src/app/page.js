import Link from 'next/link'

export default function Home() {
  return (
    <div className="bg-gradient-to-br from-stone-100/50 via-slate-50/40 to-neutral-100/50 min-h-screen">
      <header className="py-8 px-8 text-2xl font-bold tracking-wide text-slate-700 font-serif">Moiré</header>
      <main className="flex items-center min-h-[calc(100vh-80px)] px-8 md:px-16 lg:px-24">
        <div className="max-w-2xl">
          <h1 className="mb-6 text-5xl md:text-6xl lg:text-7xl font-light leading-tight text-slate-700 tracking-tight font-serif">
            See what defines you<span className="text-blue-400/60">.</span>
          </h1>
          <p className="mb-10 text-lg md:text-xl text-slate-600 leading-relaxed font-light max-w-xl">
            Turn your thoughts into insight. <span className="text-[#b88998] italic">Discover</span> recurring themes and intentions, and notice what shapes <span className="text-[#b88998] italic">you</span> over time.
          </p>
          <div className="flex gap-4 flex-wrap">
            <Link 
              href="/sign-up" 
              className="px-10 py-3.5 text-sm font-medium bg-slate-600 text-white rounded-full hover:bg-slate-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
            >
              Get Started
            </Link>
            <Link 
              href="/sign-in" 
              className="px-10 py-3.5 text-sm font-medium bg-white/80 backdrop-blur-sm text-slate-700 rounded-full hover:bg-white transition-all duration-300 shadow-md hover:shadow-lg"
            >
              Sign In
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
