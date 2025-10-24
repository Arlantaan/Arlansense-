import { products } from '../data/products'
import ProductCard from '../components/ProductCard'
import VantaBackground from '../components/VantaBackground'

const Home = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section with Vanta Background */}
      <VantaBackground effect="WAVES" className="h-screen flex items-center justify-center">
        <div className="relative z-10 max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-light text-white mb-6 drop-shadow-lg">
            Sensation by Sanu
          </h1>
          <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl mx-auto drop-shadow-md">
            Premium fragrances crafted with passion and worn with pride
          </p>
          <a 
            href="#products" 
            className="inline-block bg-white/20 backdrop-blur-sm text-white px-8 py-3 rounded-md hover:bg-white/30 transition-all duration-300 border border-white/30"
          >
            Explore Collection
          </a>
        </div>
      </VantaBackground>

      {/* Products Section */}
      <section id="products" className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-light text-center mb-12 text-gray-900">
            Our Collection
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
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