'use client';

import Link from 'next/link';
import { Users, Shirt, Baby, ArrowRight, Award, Zap, Star } from 'lucide-react';

const mainServices = [
  {
    icon: Users,
    title: "Women's Wear",
    description: 'Comprehensive tailoring services for women - from everyday wear to special occasions.',
    href: '/book',
    color: 'bg-pink-100',
    iconColor: 'text-pink-600',
    buttonColor: 'bg-pink-600 hover:bg-pink-700'
  },
  {
    icon: Shirt,
    title: "Men's Wear",
    description: 'Professional tailoring for men - formal wear, ethnic wear, and custom fittings.',
    href: '/book',
    color: 'bg-blue-100',
    iconColor: 'text-blue-600',
    buttonColor: 'bg-blue-600 hover:bg-blue-700'
  },
  {
    icon: Baby,
    title: "Kids' Wear",
    description: 'Custom kids clothing and uniforms designed for comfort and style.',
    href: '/book',
    color: 'bg-green-100',
    iconColor: 'text-green-600',
    buttonColor: 'bg-green-600 hover:bg-green-700'
  }
]

const womenServices = [
  {
    title: 'Alteration Work',
    description: 'Button, zip, hook, or lining replacement — quick and precise, Add padding, shape adjustments, or fancy piping for a designer touch.',
    cta: 'Alteration & Repair work',
    href: '/book',
    price: 'Starting from ₹300'
  },
  {
    title: 'Blouse Stitching',
    description: 'Tailored to perfection — padded, non-padded, or fully lined.',
    cta: 'Book Blouse Stitching',
    href: '/book',
    price: 'Starting from ₹800'
  },
  {
    title: 'Lehenga & Skirts',
    description: 'Custom-fit lehengas with can-can, panels. Designed for every celebration.',
    cta: 'Get Custom Lehenga',
    href: '/book',
    price: 'Starting from ₹2500'
  },
  {
    title: 'Salwar & Kurtis',
    description: 'Made-to-measure kurtis, salwars, and dupatta finishing. Choose from classic, Anarkali, or Indo-western styles.',
    cta: 'Stitch My Outfit',
    href: '/book',
    price: 'Starting from ₹1200'
  },
  {
    title: 'Gowns & Dresses',
    description: 'Western and Indo-western gowns crafted with precision — perfect fit, flow, and finish.',
    cta: 'Design My Gown',
    href: '/book',
    price: 'Starting from ₹2000'
  },
  {
    title: 'Trousers',
    description: 'Corporate trousers to normal pants.',
    cta: 'Stitch my trouser',
    href: '/book',
    price: 'Starting from ₹600'
  },
  {
    title: 'Saree Services',
    description: 'From saree fall and pico to pre-stitched drapes and blouse attachment — we handle it all.',
    cta: 'Fix My Saree',
    href: '/book',
    price: 'Starting from ₹500'
  },
  {
    title: 'Bridal & Occasion Wear',
    description: 'Couture craftsmanship for your big day — bridal lehengas, gowns, or sherwanis.',
    cta: 'Start Bridal Project',
    href: '/book',
    price: 'Starting from ₹5000'
  },
  {
    title: 'Couture Finishing',
    description: 'Luxury Couture work, designer pieces.',
    cta: 'Get Luxury Finish',
    href: '/book',
    price: 'Starting from ₹8000'
  }
]

const menServices = [
  {
    title: 'Shirt Stitching',
    description: 'Formal or casual shirts tailored to your fit and fabric — perfect collars, cuffs, and detailing.',
    cta: 'Book Shirt Stitching',
    href: '/book',
    price: 'Starting from ₹800'
  },
  {
    title: 'Trousers & Pants',
    description: 'Professional finishing with elastic, zip, or hook closures. Choose formal, chinos, or casual fits.',
    cta: 'Order Custom Trousers',
    href: '/book',
    price: 'Starting from ₹700'
  },
  {
    title: 'Ethnic Wear',
    description: 'Classic kurtas, pathanis, sherwanis, and Nehru jackets — bespoke tailoring for every occasion.',
    cta: 'Stitch Ethnic Wear',
    href: '/book',
    price: 'Starting from ₹1500'
  },
  {
    title: 'Alterations',
    description: 'Perfect fit guaranteed — waist, sleeves, tapering, zips, or re-stitching.',
    cta: 'Alter My Clothes',
    href: '/book',
    price: 'Starting from ₹250'
  }
]

const kidsServices = [
  {
    title: 'Custom Kidswear',
    description: 'From playful frocks to ethnic sets — made for comfort, movement, and style.',
    cta: 'Order Kids Outfit',
    href: '/book',
    price: 'Starting from ₹500'
  },
  {
    title: 'Uniforms',
    description: 'School and activity uniforms with long-lasting stitches and perfect fits.',
    cta: 'Book Uniform Stitching',
    href: '/book',
    price: 'Starting from ₹400'
  }
]

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
              and guaranteed delivery timelines. From basic alterations to designer pieces.
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

      {/* Main Service Categories */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Service Categories
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choose from our comprehensive range of tailoring services
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            {mainServices.map((service, index) => {
              const Icon = service.icon
              return (
                <div key={index} className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300 text-center">
                  <div className={`${service.color} w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6`}>
                    <Icon className={`h-10 w-10 ${service.iconColor}`} />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    {service.title}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {service.description}
                  </p>
                  <Link
                    href={service.href}
                    className={`${service.buttonColor} text-white px-6 py-3 rounded-lg font-medium inline-flex items-center transition-colors duration-200`}
                  >
                    Book Appointment
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Detailed Services */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-20">
            {/* Women's Wear Services */}
            <div>
              <h3 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                <Users className="inline h-8 w-8 text-pink-600 mr-3" />
                Women&apos;s Wear Services
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {womenServices.map((service, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-6 hover:shadow-lg transition-shadow duration-300">
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">
                      {service.title}
                    </h4>
                    <p className="text-gray-600 mb-4 text-sm">
                      {service.description}
                    </p>
                    <p className="text-lg font-bold text-pink-600 mb-4">
                      {service.price}
                    </p>
                    <Link
                      href={service.href}
                      className="btn btn-outline btn-sm w-full"
                    >
                      {service.cta}
                    </Link>
                  </div>
                ))}
              </div>
            </div>

            {/* Men's Wear Services */}
            <div>
              <h3 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                <Shirt className="inline h-8 w-8 text-blue-600 mr-3" />
                Men&apos;s Wear Services
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {menServices.map((service, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-6 hover:shadow-lg transition-shadow duration-300">
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">
                      {service.title}
                    </h4>
                    <p className="text-gray-600 mb-4 text-sm">
                      {service.description}
                    </p>
                    <p className="text-lg font-bold text-blue-600 mb-4">
                      {service.price}
                    </p>
                    <Link
                      href={service.href}
                      className="btn btn-outline btn-sm w-full"
                    >
                      {service.cta}
                    </Link>
                  </div>
                ))}
              </div>
            </div>

            {/* Kids' Wear Services */}
            <div>
              <h3 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                <Baby className="inline h-8 w-8 text-green-600 mr-3" />
                Kids&apos; Wear Services
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                {kidsServices.map((service, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-6 hover:shadow-lg transition-shadow duration-300">
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">
                      {service.title}
                    </h4>
                    <p className="text-gray-600 mb-4 text-sm">
                      {service.description}
                    </p>
                    <p className="text-lg font-bold text-green-600 mb-4">
                      {service.price}
                    </p>
                    <Link
                      href={service.href}
                      className="btn btn-outline btn-sm w-full"
                    >
                      {service.cta}
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose SilaiWala?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We&apos;re committed to providing the best tailoring experience with transparency and quality.
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
