import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const bundles = [
  {
    id: 1,
    name: "Complete Skincare Bundle",
    price: 8999,
    savings: 2000,
    items: 3,
    image: "/skincare-bundle-set.jpg",
  },
  {
    id: 2,
    name: "Hair Care Essentials",
    price: 6999,
    savings: 1500,
    items: 2,
    image: "/hair-oil-serum-bundle.jpg",
  },
  {
    id: 3,
    name: "Organic Health Pack",
    price: 7499,
    savings: 1800,
    items: 3,
    image: "/organic-food-seeds-honey.jpg",
  },
]

export default function Bundles() {
  return (
    <section className="py-8 sm:py-12 md:py-16 bg-muted/50">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-2 text-foreground">Product Bundles</h2>
        <p className="text-center text-muted-foreground mb-8 sm:mb-12">
          Get more with our curated product combinations at special prices
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {bundles.map((bundle) => (
            <Card key={bundle.id} className="overflow-hidden hover:shadow-lg transition">
              <CardContent className="p-0">
                <div className="relative overflow-hidden bg-muted h-40 sm:h-48">
                  <img
                    src={bundle.image || "/placeholder.svg"}
                    alt={bundle.name}
                    className="w-full h-full object-cover hover:scale-110 transition duration-300"
                  />
                  <div className="absolute top-2 left-2 bg-secondary text-accent font-bold px-3 py-1 rounded text-xs sm:text-sm">
                    Save Rs. {bundle.savings}
                  </div>
                </div>
                <div className="p-4 sm:p-6">
                  <h3 className="font-bold text-base sm:text-lg mb-2 text-foreground">{bundle.name}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-3">
                    {bundle.items} products in this bundle
                  </p>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-lg sm:text-xl font-bold text-primary">Rs. {bundle.price}</span>
                  </div>
                  <Button className="w-full text-sm sm:text-base">View Bundle</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
