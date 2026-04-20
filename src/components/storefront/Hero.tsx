import Link from 'next/link'

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden -mt-20">

      {/* Background video */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        aria-hidden="true"
      >
        <source src="/hero-bg.mp4" type="video/mp4" />
      </video>

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-brand-navy/70" />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto w-full px-6 lg:px-10 py-16 animate-fade-in">
        <p className="font-body text-sm font-semibold tracking-widest text-brand-gold uppercase mb-4">
          Mixer Grinders &amp; Kitchen Appliances
        </p>

        <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6">
          Sri Lanka&apos;s Home for<br />
          <span className="italic text-brand-gold">Mixer Grinders</span>
        </h1>

        <p className="font-body text-lg md:text-xl text-white/80 leading-relaxed mb-10 max-w-xl animate-fade-in-delay">
          Shop 100+ grinder models, genuine spare parts, and kitchen accessories — all in one place.
        </p>

        <div className="flex flex-wrap items-center gap-4 animate-fade-in-delay-2">
          <Link
            href="/shop"
            className="inline-block bg-brand-gold hover:bg-white hover:text-brand-navy text-white font-body font-semibold text-sm tracking-wide px-8 py-4 transition-colors duration-300"
          >
            Shop Now
          </Link>
          <Link
            href="/about"
            className="inline-block font-body font-medium text-sm text-white underline underline-offset-4 decoration-brand-gold hover:text-brand-gold transition-colors duration-200"
          >
            Learn More →
          </Link>
        </div>
      </div>

    </section>
  )
}
