import React from 'react';
import { Star, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';

const reviews = [
  {
    id: 1,
    name: 'Sarah M.',
    text: '"I\'m blown away by the quality and style of the clothes I received. The pieces are incredible, they fit perfectly and have a unique streetwear vibe that I love!"'
  },
  {
    id: 2,
    name: 'Alex K.',
    text: '"Finding clothes that are comfortable and look great is usually a challenge, but Hoodie nails it. The materials are premium and the designs are just next level."'
  },
  {
    id: 3,
    name: 'James L.',
    text: '"Absolutely love the new jacket I bought. I\'ve gotten so many compliments on it. Shipping was fast and the packaging felt really premium. Highly recommend!"'
  }
];

const Testimonials = () => {
  return (
    <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-12">
        <h2 className="text-3xl md:text-4xl font-bold">Our Happy Customers</h2>
        <div className="flex gap-2">
          <button className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center hover:bg-gray-800 transition-colors">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {reviews.map((review) => (
          <div key={review.id} className="bg-white border border-gray-100 p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
            <div className="flex gap-1 text-yellow-500 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-current" />
              ))}
            </div>
            <div className="flex items-center gap-2 mb-4">
              <span className="font-bold">{review.name}</span>
              <CheckCircle2 className="w-4 h-4 text-green-500" />
            </div>
            <p className="text-gray-500 text-sm leading-relaxed">
              {review.text}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Testimonials;
