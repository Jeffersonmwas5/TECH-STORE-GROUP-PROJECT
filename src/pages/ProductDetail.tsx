import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useCartStore } from '../store/useCartStore';
import { ShoppingCart, Star, ArrowLeft, ShieldCheck, Truck, RotateCcw } from 'lucide-react';
import { motion } from 'motion/react';
import { formatPrice } from '../lib/utils';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCartStore();

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      try {
        const docRef = doc(db, 'products', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProduct({ id: docSnap.id, ...docSnap.data() });
        } else {
          console.log("No such document!");
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-bg py-12 px-4 sm:px-6 lg:px-8 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-brand-bg py-12 px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-2xl font-bold text-brand-dark mb-4">Product not found</h2>
        <Link to="/catalog" className="text-brand-primary hover:underline flex items-center justify-center gap-2">
          <ArrowLeft size={20} /> Back to Catalog
        </Link>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (product.stock <= 0) {
      alert("This product is out of stock.");
      return;
    }
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      discountPrice: product.discountPrice,
      imageUrl: product.imageUrl,
      stock: product.stock,
    });
  };

  return (
    <div className="min-h-screen bg-brand-bg py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/catalog" className="inline-flex items-center gap-2 text-brand-medium hover:text-brand-primary mb-8 transition-colors">
          <ArrowLeft size={20} /> Back to Catalog
        </Link>
        
        <div className="bg-white rounded-3xl shadow-sm border border-brand-light overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16 p-8 lg:p-12">
            
            {/* Product Image */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="relative aspect-square bg-brand-bg rounded-2xl flex items-center justify-center p-8"
            >
              {product.discountPrice && (
                <div className="absolute top-6 left-6 z-10 bg-brand-primary text-white text-sm font-bold px-4 py-2 rounded-full shadow-lg">
                  Sale
                </div>
              )}
              <img 
                src={product.imageUrl} 
                alt={product.name} 
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </motion.div>

            {/* Product Details */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex flex-col justify-center"
            >
              <div className="mb-6">
                <span className="text-sm font-medium text-brand-primary tracking-wider uppercase mb-2 block">
                  {product.category}
                </span>
                <h1 className="text-3xl sm:text-4xl font-bold text-brand-dark mb-4">
                  {product.name}
                </h1>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1 bg-brand-light px-3 py-1 rounded-full">
                    <Star className="w-5 h-5 fill-brand-primary text-brand-primary" />
                    <span className="font-medium text-brand-dark">{product.rating.toFixed(1)}</span>
                  </div>
                  <span className="text-sm text-brand-medium">
                    {product.stock > 0 ? (
                      <span className="text-green-600 font-medium">In Stock ({product.stock})</span>
                    ) : (
                      <span className="text-red-600 font-medium">Out of Stock</span>
                    )}
                  </span>
                </div>
              </div>

              <div className="mb-8">
                {product.discountPrice ? (
                  <div className="flex items-end gap-4">
                    <span className="text-4xl font-bold text-brand-primary">KES {formatPrice(product.discountPrice)}</span>
                    <span className="text-xl text-brand-medium line-through mb-1">KES {formatPrice(product.price)}</span>
                  </div>
                ) : (
                  <span className="text-4xl font-bold text-brand-dark">KES {formatPrice(product.price)}</span>
                )}
              </div>

              <p className="text-brand-medium mb-8 leading-relaxed">
                {product.description}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 border-y border-brand-light py-6">
                <div className="flex flex-col items-center text-center">
                  <ShieldCheck className="w-6 h-6 text-brand-primary mb-2" />
                  <span className="text-xs font-medium text-brand-dark">1 Year Warranty</span>
                </div>
                <div className="flex flex-col items-center text-center">
                  <Truck className="w-6 h-6 text-brand-primary mb-2" />
                  <span className="text-xs font-medium text-brand-dark">Free Shipping</span>
                </div>
                <div className="flex flex-col items-center text-center">
                  <RotateCcw className="w-6 h-6 text-brand-primary mb-2" />
                  <span className="text-xs font-medium text-brand-dark">30-Day Returns</span>
                </div>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
                className="btn-primary w-full py-4 px-8 text-lg flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingCart size={24} />
                {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
              </button>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
