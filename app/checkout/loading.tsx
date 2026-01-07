import Header from "@/components/header"
import Footer from "@/components/footer"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function CheckoutLoading() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-br from-background via-background to-muted/40">
        <div className="container mx-auto px-4 py-10 space-y-8">
          <div className="space-y-3 animate-pulse">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-4 w-48" />
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <Card className="bg-card/80 backdrop-blur">
                <CardHeader>
                  <CardTitle>Shipping Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-14 w-full" />
                </CardContent>
              </Card>

              <Card className="bg-card/80 backdrop-blur">
                <CardHeader>
                  <CardTitle>Payment Method</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Skeleton className="h-14 w-full" />
                  <Skeleton className="h-14 w-full" />
                </CardContent>
              </Card>
            </div>

            <div className="sticky top-24 space-y-4">
              <Card className="bg-card/80 backdrop-blur">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[1,2,3].map((key) => (
                    <div key={key} className="flex gap-3">
                      <Skeleton className="h-16 w-16 rounded-md" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-2/4" />
                        <Skeleton className="h-4 w-1/2" />
                      </div>
                    </div>
                  ))}
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-4/6" />
                  <Skeleton className="h-12 w-full" />
                </CardContent>
                <CardFooter>
                  <Skeleton className="h-11 w-full" />
                </CardFooter>
              </Card>
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
