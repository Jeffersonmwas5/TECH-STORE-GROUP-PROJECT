import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, addDoc, updateDoc, deleteDoc, doc, deleteField, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../hooks/useAuth';
import { Plus, Edit, Trash2, LogOut, Package, DollarSign, Image as ImageIcon, ShoppingBag, CheckCircle, Truck, MapPin, XCircle, Clock } from 'lucide-react';
import { motion } from 'motion/react';
import { formatPrice } from '../lib/utils';

export default function AdminDashboard() {
  const { user, isAdmin, loading, login, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'products' | 'orders'>('products');
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    discountPrice: '',
    category: 'Phones',
    imageUrl: '',
    stock: '',
    rating: '5',
    isFeatured: false,
  });

  const fetchProducts = async () => {
    try {
      const q = query(collection(db, 'products'));
      const querySnapshot = await getDocs(q);
      const fetchedProducts = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProducts(fetchedProducts);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const fetchOrders = async () => {
    try {
      const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const fetchedOrders = querySnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      }));
      setOrders(fetchedOrders);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchProducts();
      fetchOrders();
    }
  }, [isAdmin]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.match('image/(jpeg|png)')) {
      alert('Please upload a valid JPG or PNG image.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
        setFormData(prev => ({ ...prev, imageUrl: dataUrl }));
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.imageUrl && !isEditing) {
      alert("Please upload a product image.");
      return;
    }

    try {
      const productData: any = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        category: formData.category,
        stock: parseInt(formData.stock),
        rating: parseFloat(formData.rating),
        isFeatured: formData.isFeatured,
      };

      if (formData.imageUrl) {
        productData.imageUrl = formData.imageUrl;
      }

      if (formData.discountPrice) {
        productData.discountPrice = parseFloat(formData.discountPrice);
      } else if (isEditing) {
        productData.discountPrice = deleteField(); // Clear discount if empty
      }

      if (isEditing && currentProduct) {
        const docRef = doc(db, 'products', currentProduct.id);
        await updateDoc(docRef, productData);
      } else {
        productData.createdAt = new Date();
        await addDoc(collection(db, 'products'), productData);
      }

      setFormData({
        name: '', description: '', price: '', discountPrice: '', category: 'Phones', imageUrl: '', stock: '', rating: '5', isFeatured: false,
      });
      setIsEditing(false);
      setCurrentProduct(null);
      fetchProducts();
    } catch (error) {
      console.error("Error saving product:", error);
      alert("Error saving product. Check console for details.");
    }
  };

  const handleEdit = (product: any) => {
    setCurrentProduct(product);
    setFormData({
      name: product.name || '',
      description: product.description || '',
      price: product.price !== undefined ? product.price.toString() : '0',
      discountPrice: product.discountPrice ? product.discountPrice.toString() : '',
      category: product.category || 'Phones',
      imageUrl: '', // clear image url so it doesn't overwrite unless a new one is uploaded
      stock: product.stock !== undefined ? product.stock.toString() : '0',
      rating: product.rating ? product.rating.toString() : '5',
      isFeatured: product.isFeatured || false,
    });
    setIsEditing(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteDoc(doc(db, 'products', id));
        fetchProducts();
      } catch (error) {
        console.error("Error deleting product:", error);
      }
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, { status: newStatus });
      fetchOrders();
    } catch (error) {
      console.error("Error updating order status:", error);
      alert("Failed to update order status.");
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

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-brand-bg"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div></div>;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-brand-bg flex flex-col items-center justify-center p-4 text-center">
        <div className="w-20 h-20 bg-brand-light rounded-full flex items-center justify-center mb-6">
          <Package className="w-10 h-10 text-brand-primary" />
        </div>
        <h1 className="text-3xl font-bold text-brand-dark mb-4">Admin Dashboard</h1>
        <p className="text-brand-medium mb-8 max-w-md">Please sign in with your administrator account to access the dashboard.</p>
        <button onClick={login} className="btn-primary px-8 py-4">
          Sign In with Google
        </button>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-brand-bg flex flex-col items-center justify-center p-4 text-center">
        <h1 className="text-3xl font-bold text-red-600 mb-4">Access Denied</h1>
        <p className="text-brand-medium mb-8 max-w-md">You do not have administrator privileges. Please contact support if you believe this is an error.</p>
        <button onClick={logout} className="px-8 py-4 bg-white border border-brand-light hover:bg-brand-light text-brand-dark rounded-full font-bold transition-colors">
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-bg py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <h1 className="text-3xl font-bold text-brand-dark">Admin Dashboard</h1>
          <div className="flex items-center gap-4">
            <div className="flex bg-white rounded-lg p-1 border border-brand-light shadow-sm">
              <button 
                onClick={() => setActiveTab('products')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'products' ? 'bg-brand-bg text-brand-dark shadow-sm' : 'text-brand-medium hover:text-brand-dark'}`}
              >
                <div className="flex items-center gap-2"><Package size={16} /> Products</div>
              </button>
              <button 
                onClick={() => setActiveTab('orders')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'orders' ? 'bg-brand-bg text-brand-dark shadow-sm' : 'text-brand-medium hover:text-brand-dark'}`}
              >
                <div className="flex items-center gap-2"><ShoppingBag size={16} /> Orders</div>
              </button>
            </div>
            <button onClick={logout} className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors">
              <LogOut size={18} /> Sign Out
            </button>
          </div>
        </div>

        {activeTab === 'products' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Product Form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl shadow-sm border border-brand-light p-6 sticky top-24">
              <h2 className="text-xl font-bold text-brand-dark mb-6 flex items-center gap-2">
                {isEditing ? <Edit size={20} /> : <Plus size={20} />}
                {isEditing ? 'Edit Product' : 'Add New Product'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-brand-dark mb-1">Product Name</label>
                  <input type="text" name="name" required value={formData.name} onChange={handleInputChange} className="w-full px-3 py-2 border border-brand-light rounded-lg bg-white text-brand-dark focus:ring-2 focus:ring-brand-primary" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-brand-dark mb-1">Description</label>
                  <textarea name="description" required rows={3} value={formData.description} onChange={handleInputChange} className="w-full px-3 py-2 border border-brand-light rounded-lg bg-white text-brand-dark focus:ring-2 focus:ring-brand-primary"></textarea>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-brand-dark mb-1">Price (KES)</label>
                    <div className="relative">
                      <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-medium" />
                      <input type="number" step="0.01" name="price" required value={formData.price} onChange={handleInputChange} className="w-full pl-8 pr-3 py-2 border border-brand-light rounded-lg bg-white text-brand-dark focus:ring-2 focus:ring-brand-primary" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-brand-dark mb-1">Discount Price</label>
                    <div className="relative">
                      <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-medium" />
                      <input type="number" step="0.01" name="discountPrice" value={formData.discountPrice} onChange={handleInputChange} className="w-full pl-8 pr-3 py-2 border border-brand-light rounded-lg bg-white text-brand-dark focus:ring-2 focus:ring-brand-primary" />
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-brand-dark mb-1">Category</label>
                    <select name="category" required value={formData.category} onChange={handleInputChange} className="w-full px-3 py-2 border border-brand-light rounded-lg bg-white text-brand-dark focus:ring-2 focus:ring-brand-primary">
                      <option value="Phones">Phones</option>
                      <option value="Laptops">Laptops</option>
                      <option value="Accessories">Accessories</option>
                      <option value="Gaming">Gaming</option>
                      <option value="Smart Devices">Smart Devices</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-brand-dark mb-1">Stock</label>
                    <input type="number" name="stock" required value={formData.stock} onChange={handleInputChange} className="w-full px-3 py-2 border border-brand-light rounded-lg bg-white text-brand-dark focus:ring-2 focus:ring-brand-primary" />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-brand-dark mb-1">Product Image (JPG/PNG)</label>
                  <div className="relative flex items-center gap-4">
                    <div className="flex-1 relative">
                      <ImageIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-medium" />
                      <input 
                        type="file" 
                        accept="image/jpeg, image/png" 
                        onChange={handleImageUpload} 
                        className="w-full pl-8 pr-3 py-2 border border-brand-light rounded-lg bg-white text-brand-dark focus:ring-2 focus:ring-brand-primary file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-light file:text-brand-primary hover:file:bg-brand-primary hover:file:text-white transition-colors" 
                      />
                    </div>
                    {formData.imageUrl ? (
                      <div className="w-12 h-12 rounded-lg overflow-hidden border border-brand-light flex-shrink-0">
                        <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    ) : isEditing && currentProduct?.imageUrl ? (
                      <div className="w-12 h-12 rounded-lg overflow-hidden border border-brand-light flex-shrink-0 relative group">
                        <img src={currentProduct.imageUrl} alt="Current" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-[10px] text-white font-medium">Current</span>
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
                
                <div className="flex items-center gap-4 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" name="isFeatured" checked={formData.isFeatured} onChange={handleInputChange} className="w-4 h-4 text-brand-primary rounded focus:ring-brand-primary" />
                    <span className="text-sm font-medium text-brand-dark">Featured Product</span>
                  </label>
                </div>
                
                <div className="pt-4 flex gap-2">
                  <button type="submit" className="flex-1 py-3 btn-primary">
                    {isEditing ? 'Update Product' : 'Add Product'}
                  </button>
                  {isEditing && (
                    <button type="button" onClick={() => { setIsEditing(false); setCurrentProduct(null); setFormData({name: '', description: '', price: '', discountPrice: '', category: 'Phones', imageUrl: '', stock: '', rating: '5', isFeatured: false}); }} className="px-4 py-3 bg-brand-bg hover:bg-brand-light text-brand-dark rounded-xl font-bold transition-colors border border-brand-light">
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>

          {/* Product List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl shadow-sm border border-brand-light overflow-hidden">
              <div className="p-6 border-b border-brand-light flex justify-between items-center">
                <h2 className="text-xl font-bold text-brand-dark">Product Inventory</h2>
                <span className="bg-brand-light text-brand-primary py-1 px-3 rounded-full text-sm font-medium">
                  {products.length} Items
                </span>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-brand-bg text-brand-medium text-sm uppercase tracking-wider">
                      <th className="p-4 font-medium">Product</th>
                      <th className="p-4 font-medium">Category</th>
                      <th className="p-4 font-medium">Price</th>
                      <th className="p-4 font-medium">Stock</th>
                      <th className="p-4 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-light">
                    {products.map((product) => (
                      <motion.tr 
                        key={product.id} 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="hover:bg-brand-bg transition-colors"
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-brand-bg p-1 flex-shrink-0">
                              <img src={product.imageUrl} alt={product.name} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                            </div>
                            <div>
                              <p className="font-medium text-brand-dark line-clamp-1">{product.name}</p>
                              {product.isFeatured && <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">Featured</span>}
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-brand-medium text-sm">{product.category}</td>
                        <td className="p-4">
                          <div className="flex flex-col">
                            <span className="font-medium text-brand-dark">KES {formatPrice(product.price)}</span>
                            {product.discountPrice && <span className="text-xs text-brand-primary">Sale: KES {formatPrice(product.discountPrice)}</span>}
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${product.stock > 10 ? 'bg-green-100 text-green-800' : product.stock > 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                            {product.stock} in stock
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => handleEdit(product)} className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-brand-primary bg-brand-light hover:bg-brand-primary hover:text-white rounded-lg transition-colors">
                              <Edit size={16} /> Edit
                            </button>
                            <button onClick={() => handleDelete(product.id)} className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors">
                              <Trash2 size={16} /> Delete
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                    {products.length === 0 && (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-brand-medium">
                          No products found. Add your first product to get started.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-sm border border-brand-light overflow-hidden">
            <div className="p-6 border-b border-brand-light flex justify-between items-center bg-brand-bg">
              <h2 className="text-xl font-bold text-brand-dark flex items-center gap-2">
                <ShoppingBag size={20} /> Order Management
              </h2>
              <span className="bg-brand-light text-brand-primary py-1 px-3 rounded-full text-sm font-medium">
                {orders.length} Orders
              </span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-brand-bg text-brand-medium text-sm uppercase tracking-wider">
                    <th className="p-4 font-medium">Order ID & Date</th>
                    <th className="p-4 font-medium">Customer</th>
                    <th className="p-4 font-medium">Items</th>
                    <th className="p-4 font-medium">Total</th>
                    <th className="p-4 font-medium">Status</th>
                    <th className="p-4 font-medium text-right">Update Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-light">
                  {orders.map((order) => (
                    <motion.tr 
                      key={order.id} 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-brand-bg transition-colors"
                    >
                      <td className="p-4">
                        <div className="font-medium text-brand-dark text-sm mb-1">#{order.id.slice(0, 8)}...</div>
                        <div className="text-xs text-brand-medium">{order.createdAt.toLocaleDateString()} {order.createdAt.toLocaleTimeString()}</div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm font-medium text-brand-dark">{order.shippingDetails?.fullName || 'Unknown'}</div>
                        <div className="text-xs text-brand-medium">{order.shippingDetails?.email || ''}</div>
                        <div className="text-xs text-brand-medium">{order.shippingDetails?.phone || ''}</div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm text-brand-dark">
                          {order.items?.length || 0} items
                        </div>
                        <div className="text-xs text-brand-medium truncate max-w-[150px]">
                          {order.items?.map((item: any) => item.name).join(', ')}
                        </div>
                      </td>
                      <td className="p-4 font-bold text-brand-dark">
                        KES {formatPrice(order.totalAmount)}
                      </td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize inline-flex items-center gap-1 ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <select 
                          value={order.status}
                          onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                          className="px-3 py-1.5 border border-brand-light rounded-lg bg-white text-sm font-medium text-brand-dark focus:ring-2 focus:ring-brand-primary outline-none"
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="shipped">Shipped</option>
                          <option value="out for delivery">Out for Delivery</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                    </motion.tr>
                  ))}
                  {orders.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-brand-medium">
                        No orders found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
