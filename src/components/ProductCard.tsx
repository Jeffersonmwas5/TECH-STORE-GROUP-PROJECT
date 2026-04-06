import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Star } from 'lucide-react';
import { useCartStore } from '../store/useCartStore';
import { motion } from 'motion/react';
import { formatPrice } from '../lib/utils';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  discountPrice?: number;
  category: string;
  imageUrl: string;
  stock: number;
  rating: number;
  isFeatured: boolean;
}

export interface ProductCardProps {
  product: Product;
  key?: React.Key;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCartStore();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
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
    <motion.div 
      whileHover={{ y: -5 }}
      className="group relative bg-white rounded-2xl border border-brand-light overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col h-full"
    >
      {/* Discount Badge */}
      {product.discountPrice && (
        <div className="absolute top-4 left-4 z-10 bg-brand-primary text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
          Sale
        </div>
      )}
      
      {/* Product Image */}
      <Link to={`/product/${product.id}`} className="relative aspect-square overflow-hidden bg-brand-bg flex items-center justify-center p-6">
        <img 
          src={product.imageUrl} 
          alt={product.name}
          className="object-contain w-full h-full group-hover:scale-110 transition-transform duration-500"
          referrerPolicy="no-referrer"
        />
      </Link>

      {/* Product Info */}
      <div className="p-6 flex flex-col flex-grow">
        <div className="flex items-center gap-1 mb-2">
          <Star className="w-4 h-4 fill-brand-primary text-brand-primary" />
          <span className="text-sm font-medium text-brand-medium">{product.rating.toFixed(1)}</span>
        </div>
        
        <Link to={`/product/${product.id}`} className="block mb-2">
          <h3 className="font-semibold text-lg text-brand-dark line-clamp-1 group-hover:text-brand-primary transition-colors">
            {product.name}
          </h3>
        </Link>
        
        <p className="text-sm text-brand-medium line-clamp-2 mb-4 flex-grow">
          {product.description}
        </p>
        
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-brand-light">
          <div className="flex flex-col">
            {product.discountPrice ? (
              <>
                <span className="text-lg font-bold text-brand-primary">KES {formatPrice(product.discountPrice)}</span>
                <span className="text-sm text-brand-medium line-through">KES {formatPrice(product.price)}</span>
              </>
            ) : (
              <span className="text-lg font-bold text-brand-dark">KES {formatPrice(product.price)}</span>
            )}
          </div>
          
          <button 
            onClick={handleAddToCart}
            disabled={product.stock <= 0}
            className="p-3 rounded-full bg-brand-light text-brand-dark hover:bg-brand-primary hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Add to cart"
          >
            <ShoppingCart size={20} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
