import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import ProductDetails from './pages/ProductDetails'
import CreateListing from './pages/CreateListing'
import Listings from './pages/Listings'
import EditListing from './pages/EditListing'
import Profile from './pages/Profile'
import AdminDashboard from './pages/AdminDashboard'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import MyFavorites from './pages/MyFavorites'
import SendMessage from './pages/SendMessage'
import Inbox from './pages/Inbox'

function App() {
  return (
    <Router>
      <div className="app-container">
        <Navbar />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/listings" element={<Listings />} />
          <Route path="/listings/:id" element={<ProductDetails />} />
          <Route path="/send-message" element={<SendMessage />} />
          <Route path="/inbox" element={<Inbox />} />
          <Route path="/create-listing" element={<CreateListing />} />
          <Route path="/edit-listing/:id" element={<EditListing />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/favorites" element={<MyFavorites />} />
        </Routes>

        <footer
          style={{
            marginTop: 'auto',
            padding: '2rem 5%',
            borderTop: '1px solid var(--border-color)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <p
            style={{
              color: 'var(--text-secondary)',
              fontSize: '0.9rem'
            }}
          >
            © 2026 SwapSell. Tüm hakları saklıdır.
          </p>

          <div
            style={{
              display: 'flex',
              gap: '1rem',
              color: 'var(--text-secondary)'
            }}
          >
            <a href="#">Gizlilik Politikası</a>
            <a href="#">Kullanım Şartları</a>
          </div>
        </footer>
      </div>
    </Router>
  )
}

export default App