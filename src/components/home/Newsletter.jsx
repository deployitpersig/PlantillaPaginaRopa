import React from 'react';
import { Mail } from 'lucide-react';

const Newsletter = () => {
  return (
    <section className="px-6 md:px-12 pb-24 max-w-7xl mx-auto">
      <div className="bg-black rounded-3xl p-8 md:p-16 flex flex-col md:flex-row items-center justify-between gap-8 w-full shadow-2xl">
        <div className="w-full md:w-1/2 text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
            Stay up to date about our latest offers and stock updates
          </h2>
          <p className="text-gray-400 text-sm">
            Subscribe to our newsletter and never miss a drop.
          </p>
        </div>

        <div className="w-full md:w-1/2 flex justify-end">
          <div className="relative w-full max-w-md">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-gray-400" />
            </div>
            <input 
              type="email" 
              placeholder="Enter your email address" 
              className="w-full pl-12 pr-32 py-4 rounded-full bg-white text-black outline-none focus:ring-2 focus:ring-gray-300"
            />
            <button className="absolute right-1 top-1 bottom-1 bg-black text-white px-6 rounded-full font-medium hover:bg-gray-800 transition-colors">
              Subscribe
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;
