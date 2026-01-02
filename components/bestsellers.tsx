import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Heart, ShoppingCart } from "lucide-react"

const bestsellers = [
  {
    id: 1,
    name: "Vitamin C Serum",
    price: 1099,
    originalPrice: 1560,
    image: "/vitamin-c-serum.png",
    discount: "30%",
  },
  {
    id: 2,
    name: "Red Onion Oil",
    price: 1099,
    originalPrice: 1560,
    image: "/red-onion-hair-oil.jpg",
    discount: "30%",
  },
  {
    id: 3,
    name: "Pinkish Lips & Cheek Tint",
    price: 599,
    originalPrice: 1000,
    image: "/pink-lip-tint.jpg",
    discount: "40%",
  },
  {
    id: 4,
    name: "Chia Seeds",
    price: 1699,
    originalPrice: 2412,
    image: "/organic-chia-seeds.jpg",
    discount: "30%",
  },
]

export default function Bestsellers() {
  return (
    <section className="py-8 sm:py-12 md:py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-2 text-foreground">Best Sellers</h2>
        <p className="text-center text-muted-foreground mb-8 sm:mb-12">
          Our most loved products by thousands of customers
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {bestsellers.map((product) => (
            <Card key={product.id} className="overflow-hidden hover:shadow-lg transition">
              <CardContent className="p-0">
                <div className="relative overflow-hidden bg-muted h-40 sm:h-48">
                  <img
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    className="w-full h-full object-cover hover:scale-110 transition duration-300"
                  />
                  <div className="absolute top-2 right-2 bg-destructive text-white text-xs font-bold px-2 py-1 rounded">
                    {product.discount}
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
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1 h-8 text-xs sm:text-sm">
                      <ShoppingCart className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                      Add
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1 h-8 bg-transparent">
                      <Heart className="w-3 h-3 sm:w-4 sm:h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
