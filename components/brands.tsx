const brands = [
  {
    id: 1,
    name: "Chiltanpure Organics",
    logo: "/placeholder.svg?height=100&width=100",
  },
  {
    id: 2,
    name: "Nature Pure",
    logo: "/placeholder.svg?height=100&width=100",
  },
  {
    id: 3,
    name: "Green Wellness",
    logo: "/placeholder.svg?height=100&width=100",
  },
  {
    id: 4,
    name: "Pure Botanicals",
    logo: "/placeholder.svg?height=100&width=100",
  },
  {
    id: 5,
    name: "Organic Essentials",
    logo: "/placeholder.svg?height=100&width=100",
  },
]

export default function Brands() {
  return (
    <section className="py-8 sm:py-12 md:py-16 bg-muted/50">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-2 text-foreground">Brands We Partner With</h2>
        <p className="text-center text-muted-foreground mb-8 sm:mb-12">
          Featuring premium organic brands from around the world
        </p>

        <div className="flex flex-wrap justify-center gap-6 sm:gap-8 md:gap-12">
          {brands.map((brand) => (
            <div
              key={brand.id}
              className="flex flex-col items-center gap-3 p-4 rounded-lg hover:bg-background/50 transition cursor-pointer"
            >
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg bg-white border border-border flex items-center justify-center overflow-hidden">
                <img src={brand.logo || "/placeholder.svg"} alt={brand.name} className="w-full h-full object-cover" />
              </div>
              <p className="text-center text-sm sm:text-base font-medium text-foreground">{brand.name}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
