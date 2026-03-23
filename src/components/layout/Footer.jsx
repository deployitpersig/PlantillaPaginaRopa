import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-100 pt-16 pb-8 px-6 md:px-12">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
        {/* Brand */}
        <div>
          <h3 className="text-2xl font-black tracking-tighter mb-4">Hoodie.</h3>
          <p className="text-gray-500 text-sm mb-6 max-w-xs">
            Premium streetwear essentials. Made for the modern aesthetic with uncompromised craftsmanship.
          </p>
          <div className="flex space-x-4">
            {/* Social Icons Placeholder */}
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">In</div>
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">Tw</div>
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">Fb</div>
          </div>
        </div>

        {/* Links */}
        <div>
          <h4 className="font-semibold mb-6">Shop</h4>
          <ul className="space-y-4 text-sm text-gray-500">
            <li><a href="#" className="hover:text-black transition-colors">Mens</a></li>
            <li><a href="#" className="hover:text-black transition-colors">Womens</a></li>
            <li><a href="#" className="hover:text-black transition-colors">Kids</a></li>
            <li><a href="#" className="hover:text-black transition-colors">Accessories</a></li>
            <li><a href="#" className="hover:text-black transition-colors">Sale</a></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-6">Support</h4>
          <ul className="space-y-4 text-sm text-gray-500">
            <li><a href="#" className="hover:text-black transition-colors">Help Center</a></li>
            <li><a href="#" className="hover:text-black transition-colors">Shipping & Returns</a></li>
            <li><a href="#" className="hover:text-black transition-colors">Order Status</a></li>
            <li><a href="#" className="hover:text-black transition-colors">Contact Us</a></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-6">Company</h4>
          <ul className="space-y-4 text-sm text-gray-500">
            <li><a href="#" className="hover:text-black transition-colors">About Us</a></li>
            <li><a href="#" className="hover:text-black transition-colors">Careers</a></li>
            <li><a href="#" className="hover:text-black transition-colors">Privacy Policy</a></li>
            <li><a href="#" className="hover:text-black transition-colors">Terms of Service</a></li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between pt-8 border-t border-gray-100 text-sm text-gray-400">
        <p>© 2026 Hoodie. All rights reserved.</p>
        <div className="flex items-center space-x-4 mt-4 md:mt-0">
          <span>Visa</span>
          <span>Mastercard</span>
          <span>Paypal</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
