import React from 'react'
import { Link } from 'react-router-dom'

const NotFound: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-12 text-center">
      <h1 className="text-6xl font-bold mb-4 text-sensation-gold">404</h1>
      <h2 className="text-3xl font-bold mb-6">Page Not Found</h2>
      <p className="text-gray-600 mb-8">The page you're looking for doesn't exist.</p>
      <Link 
        to="/" 
        className="inline-block bg-sensation-gold text-sensation-dark px-8 py-3 rounded-full font-semibold hover:bg-sensation-dark-gold transition-colors"
      >
        Go Home
      </Link>
    </div>
  )
}

export default NotFound
