import { useState } from 'react'
import { Link } from 'react-router-dom'
import sbsLogo from '@/assets/images/sbs.svg'

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <img src={sbsLogo} alt="SBS Logo" className="w-10 h-10 group-hover:scale-105 transition-transform duration-300" />
            <span className="text-xl font-light text-sensation-dark tracking-wide">Sensation by Sanu</span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-12">
            <Link to="/" className="text-sensation-dark hover:text-sensation-gold transition-colors duration-300 font-light text-sm uppercase tracking-wide">
              Home
            </Link>
            <Link to="/#catalog" className="text-sensation-dark hover:text-sensation-gold transition-colors duration-300 font-light text-sm uppercase tracking-wide">
              Collection
            </Link>
            <Link to="/#about" className="text-sensation-dark hover:text-sensation-gold transition-colors duration-300 font-light text-sm uppercase tracking-wide">
              About
            </Link>
            <Link to="/#contact" className="text-sensation-dark hover:text-sensation-gold transition-colors duration-300 font-light text-sm uppercase tracking-wide">
              Contact
            </Link>
            <Link to="/track" className="text-sensation-dark hover:text-sensation-gold transition-colors duration-300 font-light text-sm uppercase tracking-wide">
              Track
            </Link>
          </div>
          
          {/* Right Side - Account & Cart */}
          <div className="flex items-center space-x-6">
            <Link to="/account" className="text-sensation-dark hover:text-sensation-gold transition-colors duration-300 font-light text-sm uppercase tracking-wide hidden sm:block">
              Account
            </Link>
            <Link to="/cart" className="relative group">
              <div className="flex items-center space-x-2 text-sensation-dark hover:text-sensation-gold transition-colors duration-300 font-light text-sm uppercase tracking-wide">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5 6m0 0h9M16 19a1 1 0 100 2 1 1 0 000-2zm-8 0a1 1 0 100 2 1 1 0 000-2z" />
                </svg>
                <span>Cart</span>
              </div>
              <span className="absolute -top-2 -right-2 bg-sensation-gold text-sensation-dark text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium hidden">
                0
              </span>
            </Link>
            
            {/* Mobile Menu Button */}
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden text-sensation-dark hover:text-sensation-gold transition-colors duration-300"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-100">
            <div className="py-4 space-y-3">
              <Link 
                to="/" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-4 py-2 text-sensation-dark hover:text-sensation-gold transition-colors duration-300 font-light text-sm uppercase tracking-wide"
              >
                Home
              </Link>
              <Link 
                to="/#catalog" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-4 py-2 text-sensation-dark hover:text-sensation-gold transition-colors duration-300 font-light text-sm uppercase tracking-wide"
              >
                Collection
              </Link>
              <Link 
                to="/#about" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-4 py-2 text-sensation-dark hover:text-sensation-gold transition-colors duration-300 font-light text-sm uppercase tracking-wide"
              >
                About
              </Link>
              <Link 
                to="/#contact" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-4 py-2 text-sensation-dark hover:text-sensation-gold transition-colors duration-300 font-light text-sm uppercase tracking-wide"
              >
                Contact
              </Link>
              <Link 
                to="/track" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-4 py-2 text-sensation-dark hover:text-sensation-gold transition-colors duration-300 font-light text-sm uppercase tracking-wide"
              >
                Track
              </Link>
              <Link 
                to="/account" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="block px-4 py-2 text-sensation-dark hover:text-sensation-gold transition-colors duration-300 font-light text-sm uppercase tracking-wide"
              >
                Account
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar