import Link from 'next/link'
import { Shirt, Users, Baby } from 'lucide-react'

const mainServices = [
  {
    icon: Users,
    title: "Women's Wear",
    description: 'Comprehensive tailoring services for women - from everyday wear to special occasions.',
    href: '/book',
    color: 'bg-pink-100',
    iconColor: 'text-pink-600'
  },
  {
    icon: Shirt,
    title: "Men's Wear",
    description: 'Professional tailoring for men - formal wear, ethnic wear, and custom fittings.',
    href: '/book',
    color: 'bg-blue-100',
    iconColor: 'text-blue-600'
  },
  {
    icon: Baby,
    title: "Kids' Wear",
    description: 'Custom kids clothing and uniforms designed for comfort and style.',
    href: '/book',
    color: 'bg-green-100',
    iconColor: 'text-green-600'
  }
]

const womenServices = [
  {
    title: 'Alteration Work',
    description: 'Button, zip, hook, or lining replacement — quick and precise, Add padding, shape adjustments, or fancy piping for a designer touch.',
    cta: 'Alteration & Repair work',
    href: '/book'
  },
  {
    title: 'Blouse Stitching',
    description: 'Tailored to perfection — padded, non-padded, or fully lined.',
    cta: 'Book Blouse Stitching',
    href: '/book'
  },
  {
    title: 'Lehenga & Skirts',
    description: 'Custom-fit lehengas with can-can, panels. Designed for every celebration.',
    cta: 'Get Custom Lehenga',
    href: '/book'
  },
  {
    title: 'Salwar & Kurtis',
    description: 'Made-to-measure kurtis, salwars, and dupatta finishing. Choose from classic, Anarkali, or Indo-western styles.',
    cta: 'Stitch My Outfit',
    href: '/book'
  },
  {
    title: 'Gowns & Dresses',
    description: 'Western and Indo-western gowns crafted with precision — perfect fit, flow, and finish.',
    cta: 'Design My Gown',
    href: '/book'
  },
  {
    title: 'Trousers',
    description: 'Corporate trousers to normal pants.',
    cta: 'Stitch my trouser',
    href: '/book'
  },
  {
    title: 'Saree Services',
    description: 'From saree fall and pico to pre-stitched drapes and blouse attachment — we handle it all.',
    cta: 'Fix My Saree',
    href: '/book'
  },
  {
    title: 'Bridal & Occasion Wear',
    description: 'Couture craftsmanship for your big day — bridal lehengas, gowns, or sherwanis.',
    cta: 'Start Bridal Project',
    href: '/book'
  },
  {
    title: 'Couture Finishing',
    description: 'Luxury Couture work, designer pieces.',
    cta: 'Get Luxury Finish',
    href: '/book'
  }
]

const menServices = [
  {
    title: 'Shirt Stitching',
    description: 'Formal or casual shirts tailored to your fit and fabric — perfect collars, cuffs, and detailing.',
    cta: 'Book Shirt Stitching',
    href: '/book'
  },
  {
    title: 'Trousers & Pants',
    description: 'Professional finishing with elastic, zip, or hook closures. Choose formal, chinos, or casual fits.',
    cta: 'Order Custom Trousers',
    href: '/book'
  },
  {
    title: 'Ethnic Wear',
    description: 'Classic kurtas, pathanis, sherwanis, and Nehru jackets — bespoke tailoring for every occasion.',
    cta: 'Stitch Ethnic Wear',
    href: '/book'
  },
  {
    title: 'Alterations',
    description: 'Perfect fit guaranteed — waist, sleeves, tapering, zips, or re-stitching.',
    cta: 'Alter My Clothes',
    href: '/book'
  }
]

const kidsServices = [
  {
    title: 'Custom Kidswear',
    description: 'From playful frocks to ethnic sets — made for comfort, movement, and style.',
    cta: 'Order Kids Outfit',
    href: '/book'
  },
  {
    title: 'Uniforms',
    description: 'School and activity uniforms with long-lasting stitches and perfect fits.',
    cta: 'Book Uniform Stitching',
    href: '/book'
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

        {/* Main Service Categories */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {mainServices.map((service, index) => {
            const Icon = service.icon
            return (
              <div key={index} className="card p-8 hover:shadow-lg transition-shadow duration-300 text-center">
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
                  className="btn btn-primary btn-lg w-full"
                >
                  Book Appointment
                </Link>
              </div>
            )
          })}
        </div>

        {/* Detailed Services */}
        <div className="space-y-16">
          {/* Women's Wear Services */}
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
              <Users className="inline h-8 w-8 text-pink-600 mr-3" />
              Women's Wear Services
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {womenServices.map((service, index) => (
                <div key={index} className="card p-6 hover:shadow-lg transition-shadow duration-300">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">
                    {service.title}
                  </h4>
                  <p className="text-gray-600 mb-4 text-sm">
                    {service.description}
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
            <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
              <Shirt className="inline h-8 w-8 text-blue-600 mr-3" />
              Men's Wear Services
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {menServices.map((service, index) => (
                <div key={index} className="card p-6 hover:shadow-lg transition-shadow duration-300">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">
                    {service.title}
                  </h4>
                  <p className="text-gray-600 mb-4 text-sm">
                    {service.description}
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
            <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
              <Baby className="inline h-8 w-8 text-green-600 mr-3" />
              Kids' Wear Services
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {kidsServices.map((service, index) => (
                <div key={index} className="card p-6 hover:shadow-lg transition-shadow duration-300">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">
                    {service.title}
                  </h4>
                  <p className="text-gray-600 mb-4 text-sm">
                    {service.description}
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

        <div className="text-center mt-16">
          <Link
            href="/book"
            className="btn btn-primary btn-lg"
          >
            Book Your Appointment Now
          </Link>
        </div>
      </div>
    </section>
  )
}
