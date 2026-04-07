import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, doc, updateDoc, increment, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useCartStore } from '../store/useCartStore';
import { useAuth } from '../hooks/useAuth';
import { CheckCircle, CreditCard, Smartphone, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { formatPrice } from '../lib/utils';

export default function Checkout() {
  const { items, getCartTotal, clearCart } = useCartStore();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    zip: '',
  });
  
  const [cardData, setCardData] = useState({
    cardNumber: '',
    expiry: '',
    cvc: ''
  });

  const [paymentMethod, setPaymentMethod] = useState<'mpesa' | 'card'>('mpesa');
  const [isProcessing, setIsProcessing] = useState(false);
  const [stkPushSent, setStkPushSent] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [paymentError, setPaymentError] = useState('');

  const total = getCartTotal();

  useEffect(() => {
    const fetchUserDetails = async () => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setFormData(prev => ({
              ...prev,
              name: data.name || prev.name,
              phone: data.phone || prev.phone,
              address: data.address || prev.address,
              city: data.city || prev.city,
              zip: data.zip || prev.zip,
            }));
          }
        } catch (error) {
          console.error("Error fetching user details:", error);
        }
      }
    };
    fetchUserDetails();
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCardInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCardData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setPaymentError('');

    try {
      if (paymentMethod === 'mpesa') {
        // Simulate M-Pesa STK Push
        setStkPushSent(true);
        await new Promise(resolve => setTimeout(resolve, 5000));
        const isSuccess = Math.random() > 0.2;
        if (!isSuccess) {
          throw new Error('M-Pesa transaction failed or was cancelled by user.');
        }
      } else {
        // Simulate Card processing
        if (!cardData.cardNumber || !cardData.expiry || !cardData.cvc) {
          throw new Error('Please fill in all card details.');
        }
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      // Save user details for future checkouts
      if (user) {
        const userRef = doc(db, 'users', user.uid);
        await setDoc(userRef, {
          name: formData.name,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          zip: formData.zip
        }, { merge: true });
      }

      const orderData = {
        userId: user?.uid || null,
        customerName: formData.name,
        customerEmail: formData.email,
        customerPhone: formData.phone,
        shippingAddress: `${formData.address}, ${formData.city}, ${formData.zip}`,
        items: items.map(item => ({
          productId: item.productId,
          name: item.name,
          price: item.discountPrice || item.price,
          quantity: item.quantity
        })),
        totalAmount: total,
        status: 'pending',
        paymentMethod: paymentMethod,
        createdAt: new Date()
      };

      const orderRef = await addDoc(collection(db, 'orders'), orderData);
      
      // Create a notification for the user
      if (user) {
        await addDoc(collection(db, 'notifications'), {
          userId: user.uid,
          title: 'Order Confirmed',
          message: `Your order #${orderRef.id.slice(-6).toUpperCase()} has been received and is pending processing.`,
          type: 'order_confirmation',
          read: false,
          createdAt: new Date()
        });
      }
      
      // Decrement stock
      for (const item of items) {
        const productRef = doc(db, 'products', item.productId);
        try {
          await updateDoc(productRef, {
            stock: increment(-item.quantity)
          });
        } catch (err) {
          console.error(`Failed to decrement stock for product ${item.productId}`, err);
        }
      }
      
      setOrderComplete(true);
      clearCart();
    } catch (error: any) {
      console.error("Error placing order:", error);
      setPaymentError(error.message || "There was an error processing your payment. Please try again.");
      setStkPushSent(false);
    } finally {
      setIsProcessing(false);
    }
  };

  if (orderComplete) {
    return (
      <div className="min-h-screen bg-brand-bg py-24 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center text-center">
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-8"
        >
          <CheckCircle className="w-12 h-12 text-green-600" />
        </motion.div>
        <h2 className="text-3xl font-bold text-brand-dark mb-4">Order Confirmed!</h2>
        <p className="text-lg text-brand-medium mb-2 max-w-md">
          Thank you for your purchase. We've received your order and it is currently pending processing.
        </p>
        <div className="bg-brand-light text-brand-dark px-6 py-4 rounded-xl mb-8 max-w-md w-full text-left">
          <p className="font-medium mb-1">📧 Order Receipt Sent</p>
          <p className="text-sm text-brand-medium">A confirmation email with your order details and summary has been sent to <strong>{formData.email}</strong>.</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => navigate('/orders')}
            className="px-8 py-4 bg-white border border-brand-light hover:bg-brand-light text-brand-dark rounded-full font-bold transition-colors"
          >
            View Orders
          </button>
          <button 
            onClick={() => navigate('/catalog')}
            className="btn-primary px-8 py-4"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="min-h-screen bg-brand-bg py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-brand-dark mb-8">Checkout</h1>
        
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Checkout Form */}
          <div className="flex-grow">
            <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-sm border border-brand-light p-8">
              <h2 className="text-xl font-bold text-brand-dark mb-6">Shipping Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-brand-dark mb-2">Full Name</label>
                  <input type="text" id="name" name="name" required value={formData.name} onChange={handleInputChange} className="block w-full px-4 py-3 border border-brand-light rounded-xl bg-white text-brand-dark placeholder-brand-medium focus:outline-none focus:ring-2 focus:ring-brand-primary transition-colors" />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-brand-dark mb-2">Email Address</label>
                  <input type="email" id="email" name="email" required value={formData.email} onChange={handleInputChange} className="block w-full px-4 py-3 border border-brand-light rounded-xl bg-white text-brand-dark placeholder-brand-medium focus:outline-none focus:ring-2 focus:ring-brand-primary transition-colors" />
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="phone" className="block text-sm font-medium text-brand-dark mb-2">Phone Number (M-Pesa)</label>
                  <input type="tel" id="phone" name="phone" required value={formData.phone} onChange={handleInputChange} placeholder="e.g. 0712345678" className="block w-full px-4 py-3 border border-brand-light rounded-xl bg-white text-brand-dark placeholder-brand-medium focus:outline-none focus:ring-2 focus:ring-brand-primary transition-colors" />
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="address" className="block text-sm font-medium text-brand-dark mb-2">Street Address</label>
                  <input type="text" id="address" name="address" required value={formData.address} onChange={handleInputChange} className="block w-full px-4 py-3 border border-brand-light rounded-xl bg-white text-brand-dark placeholder-brand-medium focus:outline-none focus:ring-2 focus:ring-brand-primary transition-colors" />
                </div>
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-brand-dark mb-2">City</label>
                  <input type="text" id="city" name="city" required value={formData.city} onChange={handleInputChange} className="block w-full px-4 py-3 border border-brand-light rounded-xl bg-white text-brand-dark placeholder-brand-medium focus:outline-none focus:ring-2 focus:ring-brand-primary transition-colors" />
                </div>
                <div>
                  <label htmlFor="zip" className="block text-sm font-medium text-brand-dark mb-2">ZIP / Postal Code</label>
                  <input type="text" id="zip" name="zip" required value={formData.zip} onChange={handleInputChange} className="block w-full px-4 py-3 border border-brand-light rounded-xl bg-white text-brand-dark placeholder-brand-medium focus:outline-none focus:ring-2 focus:ring-brand-primary transition-colors" />
                </div>
              </div>

              <h2 className="text-xl font-bold text-brand-dark mb-6 pt-6 border-t border-brand-light">Payment Method</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <div 
                  onClick={() => !isProcessing && setPaymentMethod('mpesa')}
                  className={`cursor-pointer p-4 rounded-xl border-2 transition-colors flex items-center gap-4 ${paymentMethod === 'mpesa' ? 'border-green-500 bg-green-50' : 'border-brand-light hover:border-green-300'} ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'mpesa' ? 'border-green-500' : 'border-gray-300'}`}>
                    {paymentMethod === 'mpesa' && <div className="w-3 h-3 bg-green-500 rounded-full"></div>}
                  </div>
                  <Smartphone className="text-green-600" />
                  <span className="font-medium text-brand-dark">M-Pesa</span>
                </div>
                
                <div 
                  onClick={() => !isProcessing && setPaymentMethod('card')}
                  className={`cursor-pointer p-4 rounded-xl border-2 transition-colors flex items-center gap-4 ${paymentMethod === 'card' ? 'border-brand-primary bg-brand-light' : 'border-brand-light hover:border-brand-primary'} ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'card' ? 'border-brand-primary' : 'border-brand-light'}`}>
                    {paymentMethod === 'card' && <div className="w-3 h-3 bg-brand-primary rounded-full"></div>}
                  </div>
                  <CreditCard className="text-brand-primary" />
                  <span className="font-medium text-brand-dark">Credit Card</span>
                </div>
              </div>

              {paymentMethod === 'card' && (
                <div className="mb-8 p-6 border border-brand-light rounded-xl bg-gray-50">
                  <h3 className="text-sm font-bold text-brand-dark mb-4">Card Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label htmlFor="cardNumber" className="block text-xs font-medium text-brand-dark mb-1">Card Number</label>
                      <input type="text" id="cardNumber" name="cardNumber" required value={cardData.cardNumber} onChange={handleCardInputChange} placeholder="0000 0000 0000 0000" className="block w-full px-3 py-2 border border-brand-light rounded-lg bg-white text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-primary" />
                    </div>
                    <div>
                      <label htmlFor="expiry" className="block text-xs font-medium text-brand-dark mb-1">Expiry Date</label>
                      <input type="text" id="expiry" name="expiry" required value={cardData.expiry} onChange={handleCardInputChange} placeholder="MM/YY" className="block w-full px-3 py-2 border border-brand-light rounded-lg bg-white text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-primary" />
                    </div>
                    <div>
                      <label htmlFor="cvc" className="block text-xs font-medium text-brand-dark mb-1">CVC</label>
                      <input type="text" id="cvc" name="cvc" required value={cardData.cvc} onChange={handleCardInputChange} placeholder="123" className="block w-full px-3 py-2 border border-brand-light rounded-lg bg-white text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-primary" />
                    </div>
                  </div>
                </div>
              )}

              {paymentError && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                  <AlertCircle className="text-red-600 mt-0.5 flex-shrink-0" size={20} />
                  <p className="text-sm text-red-800">{paymentError}</p>
                </div>
              )}

              {stkPushSent && (
                <div className="mb-6 p-4 bg-brand-light border border-brand-primary rounded-xl flex items-center gap-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-brand-primary"></div>
                  <p className="text-sm text-brand-dark">
                    Please check your phone ({formData.phone}) and enter your M-Pesa PIN to complete the payment.
                  </p>
                </div>
              )}

              <button 
                type="submit"
                disabled={isProcessing}
                className="btn-primary w-full py-4 px-8 text-lg flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isProcessing && !stkPushSent ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Processing Payment...
                  </>
                ) : (
                  `Pay KES ${formatPrice(total)}`
                )}
              </button>
            </form>
          </div>

          {/* Order Summary Sidebar */}
          <div className="w-full lg:w-96 flex-shrink-0">
            <div className="bg-white rounded-3xl shadow-sm border border-brand-light p-8 sticky top-24">
              <h2 className="text-xl font-bold text-brand-dark mb-6">Order Summary</h2>
              
              <ul className="divide-y divide-brand-light mb-6">
                {items.map((item) => (
                  <li key={item.productId} className="py-4 flex gap-4">
                    <div className="w-16 h-16 bg-brand-bg rounded-lg p-2 flex-shrink-0">
                      <img src={item.imageUrl} alt={item.name} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                    </div>
                    <div className="flex-grow">
                      <h3 className="text-sm font-medium text-brand-dark line-clamp-1">{item.name}</h3>
                      <p className="text-sm text-brand-medium">Qty: {item.quantity}</p>
                      <p className="text-sm font-bold text-brand-dark mt-1">KES {formatPrice((item.discountPrice || item.price) * item.quantity)}</p>
                    </div>
                  </li>
                ))}
              </ul>
              
              <div className="border-t border-brand-light pt-6">
                <div className="flex justify-between items-end">
                  <span className="text-lg font-bold text-brand-dark">Total</span>
                  <span className="text-3xl font-bold text-brand-dark">KES {formatPrice(total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
