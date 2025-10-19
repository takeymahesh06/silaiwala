import Link from 'next/link'
import { Scissors, Phone, Mail, MapPin } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <Scissors className="h-8 w-8 text-blue-400" />
              <span className="text-xl font-bold">SilaiWala</span>
            </div>
            <p className="text-gray-300 mb-4 max-w-md">
              Professional tailoring services with fixed pricing, trained tailors, and defined delivery timelines. 
              Your perfect fit, guaranteed.
            </p>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-blue-400" />
                <span className="text-sm">+91 98765 43210</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-blue-400" />
                <span className="text-sm">info@silaiwala.com</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-blue-400" />
                <span className="text-sm">Multiple locations across the city</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/services" className="text-gray-300 hover:text-white transition-colors">
                  Our Services
                </Link>
              </li>
              <li>
                <Link href="/book" className="text-gray-300 hover:text-white transition-colors">
                  Book Appointment
                </Link>
              </li>
              <li>
                <Link href="/track" className="text-gray-300 hover:text-white transition-colors">
                  Track Order
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-300 hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Services</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/services/shirts" className="text-gray-300 hover:text-white transition-colors">
                  Shirts
                </Link>
              </li>
              <li>
                <Link href="/services/blouses" className="text-gray-300 hover:text-white transition-colors">
                  Blouses
                </Link>
              </li>
              <li>
                <Link href="/services/suits" className="text-gray-300 hover:text-white transition-colors">
                  Suits
                </Link>
              </li>
              <li>
                <Link href="/services/alterations" className="text-gray-300 hover:text-white transition-colors">
                  Alterations
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400 text-sm">
            © 2024 SilaiWala. All rights reserved. | Professional Tailoring Services
          </p>
        </div>
      </div>
    </footer>
  )
}
