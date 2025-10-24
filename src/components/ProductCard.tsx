import { useState } from 'react'
import { ShoppingCart, CheckCircle } from 'lucide-react'
import { Product } from '@/types'
import { useCart } from '@/hooks/useCart'
import toast from 'react-hot-toast'

interface ProductCardProps {
  product: Product
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const { addToCart } = useCart()

  const handleAddToCart = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    
    if (isLoading || isSuccess) return

    // Add ripple effect (removed unused state)

    // Show loading state
    setIsLoading(true)

    // Haptic feedback for mobile
    if (navigator.vibrate) {
      navigator.vibrate(50)
    }

    // Simulate processing time and add to cart
    setTimeout(() => {
      try {
        const success = addToCart(product)
        
        if (success) {
          setIsSuccess(true)
          createFloatingCartIcon(e.currentTarget)
          
          // Reset button after success animation
          setTimeout(() => {
            setIsSuccess(false)
          }, 2000)
        } else {
          toast.error('Failed to add item to cart')
        }
      } catch (error) {
        console.error('Error adding to cart:', error)
        toast.error('Error adding item to cart')
      } finally {
        setIsLoading(false)
      }
    }, 800)
  }

  const createFloatingCartIcon = (buttonElement: HTMLButtonElement) => {
    const buttonRect = buttonElement.getBoundingClientRect()
    const cartIcon = document.querySelector('[href="/cart"]')
    
    if (cartIcon) {
      const cartRect = cartIcon.getBoundingClientRect()
      
      // Create floating icon
      const floatingIcon = document.createElement('div')
      floatingIcon.innerHTML = '<i class="bi bi-cart-plus" style="font-size: 2rem; color: #28a745;"></i>'
      floatingIcon.className = 'cart-float-animation'
      floatingIcon.style.left = buttonRect.left + 'px'
      floatingIcon.style.top = buttonRect.top + 'px'
      
      document.body.appendChild(floatingIcon)
      
      // Animate towards cart
      setTimeout(() => {
        floatingIcon.style.left = cartRect.left + 'px'
        floatingIcon.style.top = cartRect.top + 'px'
      }, 100)
      
      // Remove after animation
      setTimeout(() => {
        if (document.body.contains(floatingIcon)) {
          document.body.removeChild(floatingIcon)
        }
      }, 1200)
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
      {/* Product Image */}
      <div className="aspect-square bg-gray-50 p-4">
        <img 
          src={product.image} 
          className="w-full h-full object-contain" 
          alt={product.name}
        />
      </div>
      
      {/* Product Info */}
      <div className="p-4">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {product.name}
        </h3>
        
        {product.tagline && (
          <p className="text-sm text-gray-600 mb-3">
            {product.tagline}
          </p>
        )}
        
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {product.description}
        </p>
        
        <div className="flex items-center justify-between">
          <span className="text-lg font-semibold text-gray-900">
            {product.price.toLocaleString()} GMD
          </span>
          
          <button 
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              isSuccess 
                ? 'bg-green-600 text-white' 
                : isLoading 
                  ? 'bg-gray-400 text-white cursor-not-allowed' 
                  : 'bg-gray-900 text-white hover:bg-gray-800'
            }`}
            onClick={handleAddToCart}
            disabled={isLoading || isSuccess}
          >
            {isSuccess ? (
              <>
                <CheckCircle className="w-4 h-4 inline mr-1" />
                Added
              </>
            ) : isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline mr-1"></div>
                Adding...
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4 inline mr-1" />
                Add to Cart
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProductCard
