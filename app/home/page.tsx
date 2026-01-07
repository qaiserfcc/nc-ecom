import Header from "@/components/header"
import HeroBanner from "@/components/hero-banner"
import Bestsellers from "@/components/bestsellers"
import Bundles from "@/components/bundles"
import NewArrivals from "@/components/new-arrivals"
import Brands from "@/components/brands"
import AboutSection from "@/components/about-section"
import Footer from "@/components/footer"

export default function HomePage() {
  return (
    <>
      <Header />
      <main className="min-h-screen">
        <div className="container mx-auto px-4 mt-8 sm:mt-12">
          <HeroBanner />
        </div>
        <Bestsellers />
        <Bundles />
        <NewArrivals />
        <Brands />
        <AboutSection />
      </main>
      <Footer />
    </>
  )
}
