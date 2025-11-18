import { Calendar, Ruler, Scissors, Package } from 'lucide-react'

const steps = [
  {
    icon: Calendar,
    title: 'Book Appointment',
    description: 'Choose your service and schedule a convenient time for measurements.',
    step: '01'
  },
  {
    icon: Ruler,
    title: 'Get Measured',
    description: 'Our expert tailors take precise measurements and discuss your requirements.',
    step: '02'
  },
  {
    icon: Scissors,
    title: 'Crafting Begins',
    description: 'Your garment is crafted with attention to detail using quality materials.',
    step: '03'
  },
  {
    icon: Package,
    title: 'Perfect Delivery',
    description: 'Receive your perfectly tailored garment on time, every time.',
    step: '04'
  }
]

export function Process() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Our Process
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Simple, transparent, and efficient. Here&rsquo;s how we ensure your perfect fit.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon
            return (
              <div key={index} className="relative">
                {/* Connection Line */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-16 left-full w-full h-0.5 bg-gray-200 transform translate-x-4 z-0"></div>
                )}
                
                <div className="relative z-10 text-center">
                  <div className="bg-blue-600 text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 relative">
                    <Icon className="h-8 w-8" />
                    <div className="absolute -top-2 -right-2 bg-white text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                      {step.step}
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {step.title}
                  </h3>
                  <p className="text-gray-600">
                    {step.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
