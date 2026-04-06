import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { collection, query, getDocs, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import ProductCard from '../components/ProductCard';
import { Search, Filter, X } from 'lucide-react';
import { motion } from 'motion/react';

const CATEGORIES = ['All', 'Phones', 'Laptops', 'Accessories', 'Gaming', 'Smart Devices'];

export default function Catalog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'All';
  
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        let q = query(collection(db, 'products'));
        
        if (selectedCategory !== 'All') {
          q = query(collection(db, 'products'), where('category', '==', selectedCategory));
        }
        
        const querySnapshot = await getDocs(q);
        const fetchedProducts = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setProducts(fetchedProducts);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
    
    // Update URL when category changes
    if (selectedCategory === 'All') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', selectedCategory);
    }
    setSearchParams(searchParams);
  }, [selectedCategory, searchParams, setSearchParams]);

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const price = product.discountPrice || product.price;
    const matchesMinPrice = minPrice === '' || price >= parseFloat(minPrice);
    const matchesMaxPrice = maxPrice === '' || price <= parseFloat(maxPrice);
    
    return matchesSearch && matchesMinPrice && matchesMaxPrice;
  });

  return (
    <div className="min-h-screen bg-brand-bg py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header & Search */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <h1 className="text-3xl font-bold text-brand-dark">Our Products</h1>
          
          <div className="flex w-full md:w-auto gap-4">
            <div className="relative flex-grow md:w-80">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-brand-light rounded-xl leading-5 bg-white text-brand-dark placeholder-brand-medium focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary sm:text-sm transition-colors"
              />
            </div>
            <button 
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="md:hidden p-2 border border-brand-light rounded-xl bg-white text-brand-dark"
            >
              <Filter size={20} />
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Filters */}
          <div className={`md:w-64 flex-shrink-0 ${isFilterOpen ? 'block' : 'hidden md:block'}`}>
            <div className="bg-white p-6 rounded-2xl border border-brand-light sticky top-24">
              <div className="flex justify-between items-center mb-4 md:hidden">
                <h2 className="text-lg font-semibold text-brand-dark">Filters</h2>
                <button onClick={() => setIsFilterOpen(false)} className="text-brand-medium">
                  <X size={20} />
                </button>
              </div>
              
              <h3 className="font-semibold text-brand-dark mb-4">Categories</h3>
              <ul className="space-y-2 mb-8">
                {CATEGORIES.map(category => (
                  <li key={category}>
                    <button
                      onClick={() => {
                        setSelectedCategory(category);
                        setIsFilterOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 rounded-lg text-sm transition-colors ${
                        selectedCategory === category 
                          ? 'bg-brand-light text-brand-primary font-medium' 
                          : 'text-brand-medium hover:bg-brand-light'
                      }`}
                    >
                      {category}
                    </button>
                  </li>
                ))}
              </ul>

              <h3 className="font-semibold text-brand-dark mb-4">Price Range (KES)</h3>
              <div className="flex items-center gap-2 mb-4">
                <input 
                  type="number" 
                  placeholder="Min" 
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full px-3 py-2 border border-brand-light rounded-lg text-sm focus:ring-2 focus:ring-brand-primary outline-none"
                />
                <span className="text-brand-medium">-</span>
                <input 
                  type="number" 
                  placeholder="Max" 
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full px-3 py-2 border border-brand-light rounded-lg text-sm focus:ring-2 focus:ring-brand-primary outline-none"
                />
              </div>
              
              <button 
                onClick={() => {
                  setMinPrice('');
                  setMaxPrice('');
                  setSearchTerm('');
                  setSelectedCategory('All');
                }}
                className="w-full py-2 text-sm text-brand-primary hover:bg-brand-light rounded-lg transition-colors font-medium"
              >
                Clear Filters
              </button>
            </div>
          </div>

          {/* Product Grid */}
          <div className="flex-grow">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="animate-pulse bg-white rounded-2xl h-96 border border-brand-light"></div>
                ))}
              </div>
            ) : filteredProducts.length > 0 ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </motion.div>
            ) : (
              <div className="text-center py-24 bg-white rounded-2xl border border-brand-light">
                <Search className="mx-auto h-12 w-12 text-brand-medium mb-4" />
                <h3 className="text-lg font-medium text-brand-dark mb-2">No products found</h3>
                <p className="text-brand-medium">
                  Try adjusting your search or filter to find what you're looking for.
                </p>
                <button 
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('All');
                    setMinPrice('');
                    setMaxPrice('');
                  }}
                  className="mt-6 text-brand-primary hover:text-brand-primary-hover hover:underline"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
