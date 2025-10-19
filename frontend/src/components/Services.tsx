import Link from 'next/link'
import { Shirt, Scissors, Zap, Award } from 'lucide-react'

const services = [
  {
    icon: Shirt,
    title: 'Shirts',
    description: 'Custom-fitted shirts for men and women with premium fabrics and precise measurements.',
    price: 'Starting from ₹800',
    features: ['Custom measurements', 'Premium fabrics', 'Perfect fit guarantee'],
    href: '/services/shirts'
  },
  {
    icon: Scissors,
    title: 'Blouses',
    description: 'Elegant blouses tailored to perfection with attention to detail and comfort.',
    price: 'Starting from ₹600',
    features: ['Design consultation', 'Quality materials', 'Timely delivery'],
    href: '/services/blouses'
  },
  {
    icon: Zap,
    title: 'Alterations',
    description: 'Professional alteration services to make your existing clothes fit perfectly.',
    price: 'Starting from ₹200',
    features: ['Quick turnaround', 'Expert craftsmanship', 'Affordable pricing'],
    href: '/services/alterations'
  },
  {
    icon: Award,
    title: 'Designer Wear',
    description: 'High-end designer pieces with intricate work and premium finishing.',
    price: 'Starting from ₹2000',
    features: ['Designer consultation', 'Premium materials', 'Luxury finishing'],
    href: '/services/designer'
  }
]

export function Services() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Our Services
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            From basic alterations to designer pieces, we offer comprehensive tailoring services 
            with transparent pricing and guaranteed quality.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service, index) => {
            const Icon = service.icon
            return (
              <div key={index} className="card p-6 hover:shadow-lg transition-shadow duration-300">
                <div className="text-center mb-6">
                  <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {service.title}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {service.description}
                  </p>
                  <p className="text-lg font-bold text-blue-600 mb-4">
                    {service.price}
                  </p>
                </div>

                <ul className="space-y-2 mb-6">
                  {service.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center text-sm text-gray-600">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                      {feature}
                    </li>
                  ))}
                </ul>

                <Link
                  href={service.href}
                  className="btn btn-primary btn-md w-full"
                >
                  Learn More
                </Link>
              </div>
            )
          })}
        </div>

        <div className="text-center mt-12">
          <Link
            href="/services"
            className="btn btn-outline btn-lg"
          >
            View All Services
          </Link>
        </div>
      </div>
    </section>
  )
}
