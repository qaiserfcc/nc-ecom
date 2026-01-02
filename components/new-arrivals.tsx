import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

const newArrivals = [
  {
    id: 1,
    name: "Glow Facial Kit",
    price: 4599,
    originalPrice: 6865,
    image: "/facial-kit-treatment.jpg",
    badge: "New",
  },
  {
    id: 2,
    name: "Rice Facial Kit",
    price: 4599,
    originalPrice: 6865,
    image: "/rice-facial-kit.jpg",
    badge: "New",
  },
  {
    id: 3,
    name: "Tea Tree Anti Acne Face Wash",
    price: 599,
    originalPrice: 800,
    image: "/tea-tree-face-wash.jpg",
    badge: "New",
  },
  {
    id: 4,
    name: "Almond Butter",
    price: 1499,
    originalPrice: 2000,
    image: "/organic-almond-butter.jpg",
    badge: "New",
  },
]

export default function NewArrivals() {
  return (
    <section className="py-8 sm:py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">New Arrivals</h2>
            <p className="text-muted-foreground text-sm mt-2">Fresh products just added to our collection</p>
          </div>
          <Button variant="outline" className="hidden sm:flex items-center gap-2 bg-transparent">
            View All <ArrowRight className="w-4 h-4" />
          </Button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {newArrivals.map((product) => (
            <Card key={product.id} className="overflow-hidden hover:shadow-lg transition">
              <CardContent className="p-0">
                <div className="relative overflow-hidden bg-muted h-40 sm:h-48">
                  <img
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    className="w-full h-full object-cover hover:scale-110 transition duration-300"
                  />
                  <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded">
                    {product.badge}
                  </div>
                </div>
                <div className="p-3 sm:p-4">
                  <h3 className="font-semibold text-sm sm:text-base line-clamp-2 text-foreground">{product.name}</h3>
                  <div className="flex items-center gap-2 my-2">
                    <span className="text-primary font-bold text-sm sm:text-base">Rs. {product.price}</span>
                    <span className="text-xs sm:text-sm text-muted-foreground line-through">
                      Rs. {product.originalPrice}
                    </span>
                  </div>
                  <Button size="sm" className="w-full h-8 text-xs sm:text-sm">
                    Explore
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Button className="w-full sm:hidden mt-6">View All New Arrivals</Button>
      </div>
    </section>
  )
}
