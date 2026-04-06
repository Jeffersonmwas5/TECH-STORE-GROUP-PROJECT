import { Link } from 'react-router-dom';
import { ShoppingCart, Sun, Moon, Menu, X, User, Package } from 'lucide-react';
import { useCartStore } from '../store/useCartStore';
import { useThemeStore } from '../store/useThemeStore';
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import AuthModal from './AuthModal';

export default function Navbar() {
  const { items } = useCartStore();
  const { theme, toggleTheme } = useThemeStore();
  const { user, isAdmin, login, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const cartItemCount = items.reduce((total, item) => total + item.quantity, 0);

  return (
    <>
      <nav className="sticky top-0 z-50 w-full bg-brand-dark text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <Link to="/" className="flex items-center gap-2 group">
                <div className="w-8 h-8 bg-brand-primary rounded-lg flex items-center justify-center group-hover:bg-brand-primary-hover transition-colors">
                  <span className="text-white font-bold text-xl">T</span>
                </div>
                <span className="font-bold text-xl tracking-tight text-white group-hover:text-brand-primary transition-colors">TechStore</span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/catalog" className="text-sm font-medium text-brand-light hover:text-brand-primary transition-colors">Products</Link>
              <Link to="/catalog?category=Phones" className="text-sm font-medium text-brand-light hover:text-brand-primary transition-colors">Phones</Link>
              <Link to="/catalog?category=Laptops" className="text-sm font-medium text-brand-light hover:text-brand-primary transition-colors">Laptops</Link>
              
              <div className="flex items-center space-x-4 border-l border-gray-600 pl-4">
                {user && (
                  <Link to="/orders" className="p-2 rounded-full hover:bg-gray-700 transition-colors text-brand-light hover:text-brand-primary">
                    <Package size={20} />
                  </Link>
                )}

                {isAdmin && (
                  <Link to="/admin" className="flex items-center gap-1 p-2 rounded-full hover:bg-gray-700 transition-colors text-brand-primary font-medium text-sm">
                    <User size={20} />
                    <span>Admin</span>
                  </Link>
                )}

                {user ? (
                  <button onClick={logout} className="text-sm font-medium text-brand-light hover:text-brand-primary transition-colors px-2">
                    Sign Out
                  </button>
                ) : (
                  <button onClick={() => setIsAuthModalOpen(true)} className="text-sm font-medium text-brand-light hover:text-brand-primary transition-colors px-2">
                    Sign In
                  </button>
                )}

                <Link to="/cart" className="relative p-2 rounded-full hover:bg-gray-700 transition-colors text-brand-light hover:text-brand-primary">
                  <ShoppingCart size={20} />
                  {cartItemCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-brand-primary rounded-full">
                      {cartItemCount}
                    </span>
                  )}
                </Link>
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="flex items-center md:hidden space-x-4">
              <Link to="/cart" className="relative p-2 text-brand-light hover:text-brand-primary transition-colors">
                <ShoppingCart size={20} />
                {cartItemCount > 0 && (
                  <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-brand-primary rounded-full">
                    {cartItemCount}
                  </span>
                )}
              </Link>
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 text-brand-light hover:text-brand-primary transition-colors">
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-700 bg-brand-dark">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <Link to="/catalog" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-gray-700 hover:text-brand-primary transition-colors">All Products</Link>
              <Link to="/catalog?category=Phones" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-gray-700 hover:text-brand-primary transition-colors">Phones</Link>
              <Link to="/catalog?category=Laptops" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-gray-700 hover:text-brand-primary transition-colors">Laptops</Link>
              {user && (
                <Link to="/orders" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-gray-700 hover:text-brand-primary transition-colors">Order History</Link>
              )}
              {isAdmin && (
                <Link to="/admin" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-brand-primary hover:bg-gray-700 transition-colors">Admin Dashboard</Link>
              )}
              {user ? (
                <button onClick={() => { logout(); setIsMenuOpen(false); }} className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-gray-700 hover:text-brand-primary transition-colors">Sign Out</button>
              ) : (
                <button onClick={() => { setIsAuthModalOpen(true); setIsMenuOpen(false); }} className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-gray-700 hover:text-brand-primary transition-colors">Sign In</button>
              )}
            </div>
          </div>
        )}
      </nav>
      
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </>
  );
}
