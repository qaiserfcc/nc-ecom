export default function HeroBanner() {
  return (
    <section className="relative w-full h-[300px] sm:h-[400px] md:h-[500px] overflow-hidden rounded-lg md:rounded-xl bg-gradient-to-r from-primary/20 via-secondary/20 to-accent/20">
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-balance text-foreground mb-4">
          Premium Organic Products for You
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mb-6">
          Discover authentic skincare, haircare, and organic foods with profit-sharing benefits
        </p>
        <button className="px-6 sm:px-8 py-2 sm:py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition">
          Shop Now
        </button>
      </div>
      <img src="/organic-beauty-products.png" alt="Banner" className="w-full h-full object-cover opacity-30" />
    </section>
  )
}
