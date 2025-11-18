import { DollarSign, Clock, Shield, Users, CheckCircle, Star } from 'lucide-react'

const features = [
  {
    icon: DollarSign,
    title: 'Transparent Pricing',
    description: 'Fixed pricing with no hidden costs. Know exactly what you\'ll pay before you book.',
    color: 'text-green-600',
    bgColor: 'bg-green-100'
  },
  {
    icon: Clock,
    title: 'On-Time Delivery',
    description: 'Guaranteed delivery timelines. Your clothes will be ready when promised.',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100'
  },
  {
    icon: Shield,
    title: 'Quality Assurance',
    description: 'Every piece goes through quality checks to ensure perfect finishing.',
    color: 'text-purple-600',
    bgColor: 'bg-purple-100'
  },
  {
    icon: Users,
    title: 'Expert Tailors',
    description: 'Trained professionals with years of experience in precision tailoring.',
    color: 'text-orange-600',
    bgColor: 'bg-orange-100'
  },
  {
    icon: CheckCircle,
    title: 'Perfect Fit Guarantee',
    description: 'If it doesn\'t fit perfectly, we\'ll alter it again at no extra cost.',
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-100'
  },
  {
    icon: Star,
    title: 'Premium Materials',
    description: 'High-quality fabrics and materials sourced from trusted suppliers.',
    color: 'text-pink-600',
    bgColor: 'bg-pink-100'
  }
]

export function Features() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Why Choose SilaiWala?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We&rsquo;ve revolutionized the tailoring industry with standardized processes, 
            transparent pricing, and guaranteed quality.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div key={index} className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
                <div className={`${feature.bgColor} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
                  <Icon className={`h-6 w-6 ${feature.color}`} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
