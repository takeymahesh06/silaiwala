'use client';

import Link from 'next/link';
import { Zap, Award, Scissors, Star, ArrowRight } from 'lucide-react';

const services = [
  {
    id: 1,
    name: 'Shirts',
    description: 'Custom-fitted shirts for men and women with precise measurements and quality fabrics.',
    icon: Zap,
    price: 'Starting from ₹800',
    features: ['Formal & Casual', 'Premium fabrics', 'Perfect fit guarantee', '7-day delivery'],
    color: 'blue'
  },
  {
    id: 2,
    name: 'Blouses',
    description: 'Elegant blouses for women with intricate designs and professional finishing.',
    icon: Award,
    price: 'Starting from ₹600',
    features: ['Office & Party wear', 'Designer patterns', 'Quality stitching', '5-day delivery'],
    color: 'purple'
  },
  {
    id: 3,
    name: 'Suits',
    description: 'Professional business suits and blazers with expert craftsmanship.',
    icon: Star,
    price: 'Starting from ₹2000',
    features: ['Business & Formal', 'Premium materials', 'Expert tailoring', '10-day delivery'],
    color: 'green'
  },
  {
    id: 4,
    name: 'Alterations',
    description: 'Professional alteration services to make your existing clothes fit perfectly.',
    icon: Scissors,
    price: 'Starting from ₹200',
    features: ['Quick turnaround', 'Expert craftsmanship', 'Affordable pricing', '2-day delivery'],
    color: 'orange'
  }
];

const colorClasses = {
  blue: {
    bg: 'bg-blue-100',
    text: 'text-blue-600',
    button: 'bg-blue-600 hover:bg-blue-700'
  },
  purple: {
    bg: 'bg-purple-100',
    text: 'text-purple-600',
    button: 'bg-purple-600 hover:bg-purple-700'
  },
  green: {
    bg: 'bg-green-100',
    text: 'text-green-600',
    button: 'bg-green-600 hover:bg-green-700'
  },
  orange: {
    bg: 'bg-orange-100',
    text: 'text-orange-600',
    button: 'bg-orange-600 hover:bg-orange-700'
  }
};

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Our <span className="text-blue-600">Services</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Professional tailoring services with transparent pricing, expert tailors, 
              and guaranteed delivery timelines.
            </p>
            <Link
              href="/book"
              className="btn btn-primary btn-lg inline-flex items-center"
            >
              Book Appointment
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
            {services.map((service) => {
              const Icon = service.icon;
              const colors = colorClasses[service.color as keyof typeof colorClasses];
              
              return (
                <div key={service.id} className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow duration-300">
                  <div className="flex items-start space-x-4 mb-6">
                    <div className={`${colors.bg} w-16 h-16 rounded-full flex items-center justify-center`}>
                      <Icon className={`h-8 w-8 ${colors.text}`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">{service.name}</h3>
                      <p className="text-lg font-semibold text-blue-600 mb-2">{service.price}</p>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 mb-6">{service.description}</p>
                  
                  <div className="space-y-3 mb-8">
                    {service.features.map((feature, index) => (
                      <div key={index} className="flex items-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                        <span className="text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  <Link
                    href="/book"
                    className={`${colors.button} text-white px-6 py-3 rounded-lg font-medium inline-flex items-center transition-colors duration-200`}
                  >
                    Book Now
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose SilaiWala?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We're committed to providing the best tailoring experience with transparency and quality.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Transparent Pricing</h3>
              <p className="text-gray-600">No hidden costs or surprise charges. What you see is what you pay.</p>
            </div>
            
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Expert Tailors</h3>
              <p className="text-gray-600">Trained professionals with years of experience in the craft.</p>
            </div>
            
            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Quality Guarantee</h3>
              <p className="text-gray-600">Every garment is quality-checked before delivery to ensure perfection.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Book your appointment today and experience the difference of professional tailoring.
          </p>
          <Link
            href="/book"
            className="btn bg-white text-blue-600 hover:bg-gray-100 btn-lg inline-flex items-center"
          >
            Book Your Appointment
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
