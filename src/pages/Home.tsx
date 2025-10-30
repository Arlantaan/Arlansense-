import { useState, useEffect } from 'react'
import ProductCard from '../components/ProductCard'
import { Product } from '@/types'
import api from '@/lib/api'
// Vanta is now applied globally in App.tsx

const Home = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const fetchedProducts = await api.getProducts()
        setProducts(fetchedProducts)
      } catch (error) {
        console.error('Failed to fetch products:', error)
        // Fallback to empty array if API fails
        setProducts([])
      } finally {
        setLoading(false)
      }
    }
    loadProducts()
  }, [])

  return (
    <div className="min-h-screen bg-transparent relative z-10">
      {/* Hero Section */}
      <section className="h-screen flex items-center justify-center">
        <div className="relative z-10 max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-light text-black mb-6">
            Sensation by Sanu
          </h1>
          <p className="text-lg md:text-xl text-black/90 mb-8 max-w-2xl mx-auto">
            Premium fragrances crafted with passion and worn with pride
          </p>
          <a 
            href="#products" 
            className="inline-block bg-white/80 backdrop-blur-sm text-black px-8 py-3 rounded-md hover:bg-white transition-all duration-300 border border-black/20"
          >
            Explore Collection
          </a>
        </div>
      </section>

      {/* Products Section */}
      <section id="products" className="py-16 bg-transparent">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-light text-center mb-12 text-gray-900">
            Our Collection
          </h2>
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
              <p className="mt-4 text-gray-600">Loading products...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">No products available at the moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-light mb-8 text-gray-900">
            About Sensation by Sanu
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed">
            We create fragrances that transcend borders—elegant, unforgettable scents for the modern world. 
            Our curated collection is crafted using premium ingredients, designed to evoke confidence, sensuality, and timeless style.
          </p>
        </div>
      </section>
    </div>
  )
}

export default Home