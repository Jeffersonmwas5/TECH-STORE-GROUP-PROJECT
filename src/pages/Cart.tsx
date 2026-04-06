import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/useCartStore';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag } from 'lucide-react';
import { motion } from 'motion/react';
import { formatPrice } from '../lib/utils';

export default function Cart() {
  const { items, removeItem, updateQuantity, getCartTotal } = useCartStore();
  const navigate = useNavigate();
  const [discountCode, setDiscountCode] = useState('');
  const [discountApplied, setDiscountApplied] = useState(false);

  const subtotal = getCartTotal();
  const discount = discountApplied ? subtotal * 0.1 : 0; // Simulated 10% discount
  const total = subtotal - discount;

  const handleApplyDiscount = () => {
    if (discountCode.toLowerCase() === 'tech10') {
      setDiscountApplied(true);
    } else {
      alert('Invalid discount code');
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-brand-bg py-24 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center text-center">
        <div className="w-24 h-24 bg-brand-light rounded-full flex items-center justify-center mb-8">
          <ShoppingBag className="w-12 h-12 text-brand-primary" />
        </div>
        <h2 className="text-3xl font-bold text-brand-dark mb-4">Your cart is empty</h2>
        <p className="text-lg text-brand-medium mb-8 max-w-md">
          Looks like you haven't added anything to your cart yet. Discover our latest tech products.
        </p>
        <Link to="/catalog" className="btn-primary inline-flex items-center gap-2 px-8 py-4">
          Start Shopping <ArrowRight size={20} />
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-bg py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-brand-dark mb-8">Shopping Cart</h1>
        
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Cart Items */}
          <div className="flex-grow">
            <div className="bg-white rounded-3xl shadow-sm border border-brand-light overflow-hidden">
              <ul className="divide-y divide-brand-light">
                {items.map((item) => (
                  <motion.li 
                    key={item.productId} 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6"
                  >
                    <div className="w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0 bg-brand-bg rounded-2xl p-4">
                      <img 
                        src={item.imageUrl} 
                        alt={item.name} 
                        className="w-full h-full object-contain"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    
                    <div className="flex-grow flex flex-col justify-between h-full w-full">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <Link to={`/product/${item.productId}`} className="text-lg font-semibold text-brand-dark hover:text-brand-primary transition-colors line-clamp-2">
                            {item.name}
                          </Link>
                        </div>
                        <div className="text-right pl-4">
                          <p className="text-lg font-bold text-brand-dark">
                            KES {formatPrice(item.discountPrice || item.price)}
                          </p>
                          {item.discountPrice && (
                            <p className="text-sm text-brand-medium line-through">
                              KES {formatPrice(item.price)}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between mt-auto">
                        <div className="flex items-center border border-brand-light rounded-full overflow-hidden bg-brand-bg">
                          <button 
                            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                            className="p-2 text-brand-medium hover:bg-brand-light transition-colors"
                          >
                            <Minus size={16} />
                          </button>
                          <span className="w-12 text-center font-medium text-brand-dark">
                            {item.quantity}
                          </span>
                          <button 
                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                            className="p-2 text-brand-medium hover:bg-brand-light transition-colors"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                        
                        <button 
                          onClick={() => removeItem(item.productId)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                          aria-label="Remove item"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </div>
                  </motion.li>
                ))}
              </ul>
            </div>
          </div>

          {/* Order Summary */}
          <div className="w-full lg:w-96 flex-shrink-0">
            <div className="bg-white rounded-3xl shadow-sm border border-brand-light p-8 sticky top-24">
              <h2 className="text-xl font-bold text-brand-dark mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-brand-medium">
                  <span>Subtotal</span>
                  <span className="font-medium text-brand-dark">KES {formatPrice(subtotal)}</span>
                </div>
                {discountApplied && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount (10%)</span>
                    <span className="font-medium">-KES {formatPrice(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-brand-medium">
                  <span>Shipping</span>
                  <span className="font-medium text-brand-dark">Free</span>
                </div>
                <div className="flex justify-between text-brand-medium">
                  <span>Tax</span>
                  <span className="font-medium text-brand-dark">Calculated at checkout</span>
                </div>
              </div>
              
              <div className="border-t border-brand-light pt-6 mb-8">
                <div className="flex justify-between items-end">
                  <span className="text-lg font-bold text-brand-dark">Total</span>
                  <span className="text-3xl font-bold text-brand-dark">KES {formatPrice(total)}</span>
                </div>
              </div>

              {/* Discount Code */}
              <div className="mb-8">
                <label htmlFor="discount" className="block text-sm font-medium text-brand-dark mb-2">
                  Discount Code
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    id="discount"
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value)}
                    placeholder="Enter code (e.g. TECH10)"
                    className="block w-full px-4 py-3 border border-brand-light rounded-xl bg-white text-brand-dark placeholder-brand-medium focus:outline-none focus:ring-2 focus:ring-brand-primary transition-colors"
                  />
                  <button 
                    onClick={handleApplyDiscount}
                    className="px-6 py-3 bg-brand-dark text-white rounded-xl font-medium hover:bg-gray-800 transition-colors"
                  >
                    Apply
                  </button>
                </div>
              </div>

              <button 
                onClick={() => navigate('/checkout')}
                className="btn-primary w-full py-4 px-8 text-lg flex items-center justify-center gap-2"
              >
                Proceed to Checkout <ArrowRight size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
