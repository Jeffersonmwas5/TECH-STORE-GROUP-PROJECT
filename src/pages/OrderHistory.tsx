import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy, doc, updateDoc, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../hooks/useAuth';
import { Package, Clock, CheckCircle, Truck, XCircle, MapPin } from 'lucide-react';
import { motion } from 'motion/react';
import { formatPrice } from '../lib/utils';

export default function OrderHistory() {
  const { user, loading: authLoading, login } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    
    try {
      const q = query(
        collection(db, 'orders'), 
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const fetchedOrders = querySnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      }));
      setOrders(fetchedOrders);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      fetchOrders();
    }
  }, [user, authLoading]);

  const handleCancelOrder = async (orderId: string) => {
    if (window.confirm('Are you sure you want to cancel this order?')) {
      try {
        const orderRef = doc(db, 'orders', orderId);
        await updateDoc(orderRef, { status: 'cancelled' });
        
        if (user) {
          await addDoc(collection(db, 'notifications'), {
            userId: user.uid,
            title: 'Order Cancelled',
            message: `Your order #${orderId.slice(-6).toUpperCase()} has been cancelled. Please wait up to 24 hours to process the refund if you had already paid.`,
            type: 'order_cancellation',
            read: false,
            createdAt: new Date()
          });
        }
        
        fetchOrders();
      } catch (error) {
        console.error("Error cancelling order:", error);
        alert("Failed to cancel order. Please try again.");
      }
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return <Clock className="text-yellow-500" size={20} />;
      case 'confirmed': return <CheckCircle className="text-blue-500" size={20} />;
      case 'shipped': return <Truck className="text-indigo-500" size={20} />;
      case 'out for delivery': return <MapPin className="text-purple-500" size={20} />;
      case 'delivered': return <CheckCircle className="text-green-500" size={20} />;
      case 'cancelled': return <XCircle className="text-red-500" size={20} />;
      default: return <Package className="text-gray-500" size={20} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-indigo-100 text-indigo-800';
      case 'out for delivery': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getProgressPercentage = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 20;
      case 'confirmed': return 40;
      case 'shipped': return 60;
      case 'out for delivery': return 80;
      case 'delivered': return 100;
      case 'cancelled': return 0;
      default: return 0;
    }
  };

  if (authLoading || loading) {
    return <div className="min-h-screen flex items-center justify-center bg-brand-bg"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div></div>;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-brand-bg flex flex-col items-center justify-center p-4 text-center">
        <div className="w-20 h-20 bg-brand-light rounded-full flex items-center justify-center mb-6">
          <Package className="w-10 h-10 text-brand-primary" />
        </div>
        <h1 className="text-3xl font-bold text-brand-dark mb-4">Order History</h1>
        <p className="text-brand-medium mb-8 max-w-md">Please sign in to view your order history.</p>
        <button onClick={login} className="btn-primary px-8 py-4">
          Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-bg py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-brand-dark mb-8">Your Orders</h1>
        
        {orders.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-sm border border-brand-light p-12 text-center">
            <Package className="w-16 h-16 text-brand-medium mx-auto mb-4" />
            <h2 className="text-xl font-bold text-brand-dark mb-2">No orders yet</h2>
            <p className="text-brand-medium mb-6">You haven't placed any orders with us yet.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <motion.div 
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl shadow-sm border border-brand-light overflow-hidden"
              >
                <div className="p-6 border-b border-brand-light flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-brand-bg">
                  <div>
                    <p className="text-sm text-brand-medium mb-1">Order #{order.id}</p>
                    <p className="text-sm font-medium text-brand-dark">
                      Placed on {order.createdAt.toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm text-brand-medium mb-1">Total Amount</p>
                      <p className="text-lg font-bold text-brand-dark">KES {formatPrice(order.totalAmount)}</p>
                    </div>
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      <span className="text-sm font-medium capitalize">{order.status}</span>
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  {/* Progress Bar */}
                  {order.status.toLowerCase() !== 'cancelled' && (
                    <div className="mb-8">
                      <div className="flex justify-between text-xs font-medium text-brand-medium mb-2">
                        <span>Pending</span>
                        <span>Confirmed</span>
                        <span>Shipped</span>
                        <span>Out for Delivery</span>
                        <span>Delivered</span>
                      </div>
                      <div className="w-full bg-brand-light rounded-full h-2.5">
                        <div 
                          className="bg-brand-primary h-2.5 rounded-full transition-all duration-500" 
                          style={{ width: `${getProgressPercentage(order.status)}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  <h3 className="text-sm font-semibold text-brand-dark uppercase tracking-wider mb-4">Items</h3>
                  <ul className="divide-y divide-brand-light mb-6">
                    {order.items.map((item: any, index: number) => (
                      <li key={index} className="py-3 flex justify-between items-center">
                        <div className="flex items-center gap-4">
                          <span className="w-8 h-8 rounded-full bg-brand-light flex items-center justify-center text-sm font-medium text-brand-dark">
                            {item.quantity}x
                          </span>
                          <span className="font-medium text-brand-dark">{item.name}</span>
                        </div>
                        <span className="text-brand-medium">KES {formatPrice(item.price * item.quantity)}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Cancel Button */}
                  {(order.status.toLowerCase() === 'pending' || order.status.toLowerCase() === 'confirmed') && (
                    <div className="flex justify-end pt-4 border-t border-brand-light">
                      <button 
                        onClick={() => handleCancelOrder(order.id)}
                        className="px-6 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg font-medium transition-colors flex items-center gap-2"
                      >
                        <XCircle size={18} /> Cancel Order
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
