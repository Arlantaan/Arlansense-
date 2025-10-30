import { Product } from '@/types'
import { api } from '@/lib/api'
import graceImg from '@/assets/images/grace.webp'
import blackbottleImg from '@/assets/images/blackbottle.webp'
import blushImg from '@/assets/images/blush.webp'
import perfumeOilImg from '@/assets/images/perfume_oil2.webp'

// This file now uses the API to fetch products instead of static data
// The static data is kept as fallback for development

export const staticProducts: Product[] = [
  {
    id: 'soleil',
    name: 'Soleil',
    price: 5000,
    image: graceImg,
    description: 'A fruity-floral embrace with a golden glow of warmth and sophistication',
    tagline: 'not just a scent, she\'s a moment.',
    fragrancePyramid: {
      topNotes: ['Pear', 'Strawberry', 'Vanilla']
    }
  },
  {
    id: 'nuit',
    name: 'Nuit',
    price: 5000,
    image: blackbottleImg,
    description: 'Deep, magnetic, and utterly sensual. A timeless evening scent',
    tagline: 'a presence felt in silence.',
    fragrancePyramid: {
      topNotes: ['Bergamot', 'Juniperberry', 'Clary Sage', 'Mandarin']
    }
  },
  {
    id: 'blush',
    name: 'Blush',
    price: 500,
    image: blushImg,
    description: 'A soft floral with a bold undertone — confident, youthful, unforgettable'
  },
  {
    id: 'sensation-oil',
    name: 'Sensation Oil',
    price: 500,
    image: perfumeOilImg,
    description: 'An oil-based scent crafted for lasting allure — rich, mysterious, and seductive',
    tagline: 'depth in every drop.'
  }
]

// Function to fetch products from API
export const fetchProducts = async (): Promise<Product[]> => {
  try {
    const products = await api.getProducts()
    return products
  } catch (error) {
    console.error('Failed to fetch products from API, using static data:', error)
    return staticProducts
  }
}

// For backward compatibility, export the static products as default
export const products = staticProducts
