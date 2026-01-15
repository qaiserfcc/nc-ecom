import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import ProductPageClient from './client'
import { cachedQueries } from '@/lib/db'

// Generate static params for popular products (ISR)
export async function generateStaticParams() {
  try {
    // Get most viewed/popular products for static generation
    const popularProducts = await cachedQueries.getProducts({
      limit: 20,
      // Add sorting by view count or sales if available
    })

    return popularProducts.map((product: any) => ({
      id: product.id.toString(),
    }))
  } catch (error) {
    console.error('Error generating static params:', error)
    return []
  }
}

// Generate metadata for SEO
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  try {
    const { id } = await params
    const product = await cachedQueries.getProductById(parseInt(id))

    if (!product) {
      return {
        title: 'Product Not Found',
      }
    }

    const images = Array.isArray(product.images) ? product.images : []
    const primaryImage = images.find((img: any) => img.is_primary) || images[0]

    return {
      title: `${product.name} | Your E-commerce Store`,
      description: product.description?.substring(0, 160) || `Buy ${product.name} online`,
      keywords: [product.name, product.category_name, product.brand_name].filter(Boolean),
      openGraph: {
        title: product.name,
        description: product.description?.substring(0, 160),
        images: primaryImage ? [primaryImage.image_url] : [],
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: product.name,
        description: product.description?.substring(0, 160),
        images: primaryImage ? [primaryImage.image_url] : [],
      },
      other: {
        'product:price:amount': product.price?.toString(),
        'product:price:currency': 'USD',
        'product:availability': product.stock_quantity > 0 ? 'in stock' : 'out of stock',
        'product:category': product.category_name,
        'product:brand': product.brand_name,
      },
    }
  } catch (error) {
    console.error('Error generating metadata:', error)
    return {
      title: 'Product',
    }
  }
}

// ISR revalidation time (1 hour)
export const revalidate = 3600

interface ProductPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params

  try {
    // Fetch product data on server
    const product = await cachedQueries.getProductById(parseInt(id))

    if (!product) {
      notFound()
    }

    // Fetch related data
    const [activeDiscount, relatedProducts] = await Promise.all([
      cachedQueries.getActiveDiscounts(),
      cachedQueries.getProducts({
        category: product.category_id,
        limit: 4,
        // Exclude current product
      }).then(products => products.filter((p: any) => p.id !== product.id)),
    ])

    // Pre-compute image URLs for optimization
    const images = Array.isArray(product.images) ? product.images : []
    const optimizedImages = images.map((image: any) => ({
      ...image,
      optimized_url: `/api/images/optimize?url=${encodeURIComponent(image.image_url)}&w=800&h=800&f=webp&q=80`,
      thumbnail_url: `/api/images/optimize?url=${encodeURIComponent(image.image_url)}&w=300&h=300&f=webp&q=70`,
    }))

    return (
      <ProductPageClient
        initialProduct={{
          ...product,
          images: optimizedImages,
        }}
        initialDiscount={activeDiscount?.[0] || null}
        initialRelatedProducts={relatedProducts}
        slug={product.slug}
      />
    )
  } catch (error) {
    console.error('Error loading product page:', error)
    notFound()
  }
}