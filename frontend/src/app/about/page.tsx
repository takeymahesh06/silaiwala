'use client';

import { 
  Scissors, 
  Users, 
  Clock, 
  MapPin, 
  Phone, 
  Mail,
  CheckCircle,
  Star,
  Heart,
  Target,
  Zap
} from 'lucide-react';

export default function AboutPage() {
  const stats = [
    { label: 'Happy Customers', value: '10,000+', icon: Users },
    { label: 'Orders Completed', value: '25,000+', icon: CheckCircle },
    { label: 'Expert Tailors', value: '500+', icon: Scissors },
    { label: 'Cities Served', value: '50+', icon: MapPin }
  ];

  const values = [
    {
      icon: Target,
      title: 'Quality First',
      description: 'We never compromise on quality. Every garment is crafted with precision and attention to detail.'
    },
    {
      icon: Clock,
      title: 'Timely Delivery',
      description: 'We understand the importance of deadlines. Your orders are delivered on time, every time.'
    },
    {
      icon: Heart,
      title: 'Customer Satisfaction',
      description: 'Your satisfaction is our priority. We go the extra mile to ensure you love your tailored garments.'
    },
    {
      icon: Zap,
      title: 'Innovation',
      description: 'We embrace modern techniques while preserving traditional craftsmanship for the best results.'
    }
  ];

  const team = [
    {
      name: 'Rajesh Kumar',
      role: 'Founder & CEO',
      experience: '15+ years in tailoring industry',
      image: '/api/placeholder/150/150'
    },
    {
      name: 'Priya Sharma',
      role: 'Head of Operations',
      experience: '12+ years in fashion design',
      image: '/api/placeholder/150/150'
    },
    {
      name: 'Amit Patel',
      role: 'Quality Assurance Manager',
      experience: '10+ years in quality control',
      image: '/api/placeholder/150/150'
    }
  ];

  const testimonials = [
    {
      name: 'Sneha Reddy',
      location: 'Bangalore',
      service: 'Wedding Dress',
      rating: 5,
      comment: 'SilaiWala made my wedding dress dreams come true. The attention to detail and quality was exceptional.'
    },
    {
      name: 'Vikram Singh',
      location: 'Delhi',
      service: 'Formal Suits',
      rating: 5,
      comment: 'I\'ve been getting my suits tailored here for 3 years. Consistent quality and professional service.'
    },
    {
      name: 'Anita Desai',
      location: 'Mumbai',
      service: 'Blouse Alterations',
      rating: 5,
      comment: 'Quick turnaround and perfect fit. The tailor understood exactly what I wanted.'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-white bg-opacity-20 rounded-full">
                <Scissors className="h-12 w-12" />
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              About SilaiWala
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
              Transforming the tailoring industry with standardized quality, transparent pricing, and professional service.
            </p>
            <div className="flex justify-center space-x-8 text-center">
              <div>
                <div className="text-3xl font-bold">2018</div>
                <div className="text-sm opacity-90">Founded</div>
              </div>
              <div>
                <div className="text-3xl font-bold">50+</div>
                <div className="text-sm opacity-90">Cities</div>
              </div>
              <div>
                <div className="text-3xl font-bold">25K+</div>
                <div className="text-sm opacity-90">Orders</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Our Story */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
              <p className="text-lg text-gray-600 mb-6">
                SilaiWala was born from a simple observation: the tailoring industry in India, despite its rich heritage, 
                lacked standardization and transparency. Customers often faced inconsistent quality, unclear pricing, 
                and unpredictable delivery times.
              </p>
              <p className="text-lg text-gray-600 mb-6">
                Founded in 2018 by Rajesh Kumar, a veteran in the tailoring industry, SilaiWala set out to revolutionize 
                how tailoring services are delivered. We combined traditional craftsmanship with modern business practices 
                to create a reliable, professional service that customers can trust.
              </p>
              <p className="text-lg text-gray-600">
                Today, we're proud to serve thousands of customers across 50+ cities, maintaining the highest standards 
                of quality while making professional tailoring accessible to everyone.
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="text-center">
                <div className="w-32 h-32 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Scissors className="h-16 w-16 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h3>
                <p className="text-gray-600">
                  To provide standardized, high-quality tailoring services with transparent pricing, 
                  professional delivery, and exceptional customer experience.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Impact</h2>
            <p className="text-lg text-gray-600">Numbers that speak for our commitment to excellence</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                  <div className="text-gray-600">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Values</h2>
            <p className="text-lg text-gray-600">The principles that guide everything we do</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Icon className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">{value.title}</h3>
                  <p className="text-gray-600">{value.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Meet Our Team</h2>
            <p className="text-lg text-gray-600">The experts behind SilaiWala's success</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <div key={index} className="text-center">
                <div className="w-32 h-32 bg-gray-200 rounded-full mx-auto mb-6 flex items-center justify-center">
                  <Users className="h-16 w-16 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{member.name}</h3>
                <p className="text-blue-600 font-medium mb-2">{member.role}</p>
                <p className="text-gray-600 text-sm">{member.experience}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">What Our Customers Say</h2>
            <p className="text-lg text-gray-600">Real feedback from real customers</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4 italic">"{testimonial.comment}"</p>
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
      </div>

      {/* Contact Section */}
      <div className="bg-gray-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Get in Touch</h2>
            <p className="text-lg text-gray-300">Ready to experience professional tailoring? Contact us today!</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Call Us</h3>
              <p className="text-gray-300">+91 98765 43210</p>
              <p className="text-gray-300">Mon-Sat: 9AM-8PM</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Email Us</h3>
              <p className="text-gray-300">info@silaiwala.com</p>
              <p className="text-gray-300">support@silaiwala.com</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Visit Us</h3>
              <p className="text-gray-300">Multiple locations</p>
              <p className="text-gray-300">across 50+ cities</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl mb-8">
            Join thousands of satisfied customers who trust SilaiWala for their tailoring needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/book"
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Book Appointment
            </a>
            <a
              href="/services"
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
            >
              View Services
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
