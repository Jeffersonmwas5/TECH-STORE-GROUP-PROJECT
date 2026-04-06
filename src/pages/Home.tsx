import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShoppingBag, ShieldCheck, Truck } from 'lucide-react';
import { motion } from 'motion/react';

const Home = () => {
  return (
    <div className="min-h-screen bg-brand-bg">
      {/* Hero Section */}
      <section className="relative bg-brand-dark text-white py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl"
          >
            <h1 className="text-5xl font-extrabold tracking-tight mb-6">
              Next Generation <span className="text-brand-primary">Tech</span>
            </h1>
            <p className="text-xl text-gray-300 mb-10">
              Discover the latest in electronics, from powerful laptops to cutting-edge smartphones. Upgrade your life with our premium selection.
            </p>
            <Link to="/catalog" className="inline-flex items-center gap-2 bg-brand-primary hover:bg-brand-primary-hover text-white font-bold py-4 px-8 rounded-xl transition-colors text-lg">
              Shop Now <ArrowRight size={20} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-brand-bg border border-brand-light">
              <div className="w-16 h-16 bg-brand-primary/10 rounded-full flex items-center justify-center mb-4 text-brand-primary">
                <ShoppingBag size={32} />
              </div>
              <h3 className="text-xl font-bold text-brand-dark mb-2">Premium Selection</h3>
              <p className="text-brand-medium">Curated products from top brands to ensure the highest quality.</p>
            </div>
            <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-brand-bg border border-brand-light">
              <div className="w-16 h-16 bg-brand-primary/10 rounded-full flex items-center justify-center mb-4 text-brand-primary">
                <Truck size={32} />
              </div>
              <h3 className="text-xl font-bold text-brand-dark mb-2">Fast Delivery</h3>
              <p className="text-brand-medium">Get your tech gear delivered quickly and securely to your doorstep.</p>
            </div>
            <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-brand-bg border border-brand-light">
              <div className="w-16 h-16 bg-brand-primary/10 rounded-full flex items-center justify-center mb-4 text-brand-primary">
                <ShieldCheck size={32} />
              </div>
              <h3 className="text-xl font-bold text-brand-dark mb-2">Secure Shopping</h3>
              <p className="text-brand-medium">Your data and payments are protected with enterprise-grade security.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
