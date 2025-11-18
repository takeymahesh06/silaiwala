import { Star, Quote } from 'lucide-react'

const testimonials = [
  {
    name: 'Priya Sharma',
    location: 'Mumbai',
    rating: 5,
    text: 'SilaiWala transformed my wedding shopping experience. The blouse fit perfectly and was delivered exactly on time. The transparent pricing was a breath of fresh air!',
    service: 'Wedding Blouse'
  },
  {
    name: 'Rajesh Kumar',
    location: 'Delhi',
    rating: 5,
    text: 'I\'ve been getting my shirts tailored here for 6 months now. The quality is consistent, pricing is fair, and the tailors are true professionals.',
    service: 'Formal Shirts'
  },
  {
    name: 'Anita Patel',
    location: 'Bangalore',
    rating: 5,
    text: 'The alteration service saved my favorite dress! Quick turnaround, perfect fit, and very reasonable pricing. Highly recommended.',
    service: 'Dress Alteration'
  }
]

export function Testimonials() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            What Our Customers Say
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Don&rsquo;t just take our word for it. Here&rsquo;s what our satisfied customers have to say.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="flex items-center mb-4">
                <Quote className="h-8 w-8 text-blue-600 mr-2" />
                <div className="flex">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
              </div>
              
              <p className="text-gray-600 mb-6 italic">
                &ldquo;{testimonial.text}&rdquo;
              </p>
              
              <div className="border-t pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                    <p className="text-sm text-gray-500">{testimonial.location}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-blue-600">{testimonial.service}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
