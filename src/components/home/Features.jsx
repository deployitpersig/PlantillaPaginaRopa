import React from 'react';
import { Heart, Smile, Zap } from 'lucide-react';

const Features = () => {
  return (
    <section className="w-full bg-[#f0f9ff] relative overflow-hidden flex flex-col md:flex-row items-center justify-between">
      {/* Left Content */}
      <div className="w-full md:w-1/2 py-20 px-6 md:pl-24 lg:pl-32 xl:pl-48">
        <h2 className="text-4xl md:text-5xl font-bold mb-16 leading-tight max-w-md">
          Why you'll love to shop on our website
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-12 max-w-2xl">
          {/* Feature 1 */}
          <div className="flex flex-col">
            <Heart className="w-6 h-6 mb-4" />
            <h3 className="font-bold text-lg mb-2">Made with love</h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              Our products are crafted with highest care, making sure every stitch and seam is perfect. Uncompromised quality guaranteed.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="flex flex-col">
            <Smile className="w-6 h-6 mb-4" />
            <h3 className="font-bold text-lg mb-2">Friendly Customer Service</h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              We are available 24/7 to solve your queries. Dedicated team of professionals dealing with your problems.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="flex flex-col">
            <Zap className="w-6 h-6 mb-4" />
            <h3 className="font-bold text-lg mb-2">Fast Delivery</h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              Get your orders delivered right to your doorstep, fast and secure. We ensure shipping within 48 hours for premium members.
            </p>
          </div>
        </div>
      </div>

      {/* Right Content Image */}
      <div className="w-full md:w-1/2 h-[500px] md:h-auto flex self-end">
        <img 
          src="https://images.unsplash.com/photo-1583846783214-7229a91b20ed?auto=format&fit=crop&q=80&w=800" 
          alt="Model in streetwear sitting" 
          className="w-full h-full object-contain md:object-cover object-bottom"
        />
      </div>
    </section>
  );
};

export default Features;
