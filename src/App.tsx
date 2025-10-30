import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Cart from './pages/Cart'
import Footer from './components/Footer'
import AdminDashboard from './pages/AdminDashboard'
import VantaBackground from './components/VantaBackground'
import { CartProvider } from './contexts/CartContext'

function App() {
  return (
    <CartProvider>
      <Router>
        <VantaBackground effect="WAVES">
          <div className="relative z-10 min-h-screen bg-transparent flex flex-col pt-20">
            <Navbar />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/admin" element={<AdminDashboard />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </VantaBackground>
      </Router>
    </CartProvider>
  )
}

export default App