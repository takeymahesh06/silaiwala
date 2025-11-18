'use client';

import { useState } from 'react';
import { Calendar, Clock, User, Phone, Mail, MapPin, Scissors, AlertCircle } from 'lucide-react';
import { useEffect } from 'react';
import { apiRequest } from '@/lib/api';
import PricePreview from '@/components/PricePreview';
import { getPricingAreas } from '@/lib/pricing';

interface AppointmentFormData {
  name: string;
  email: string;
  phone: string;
  service: string; // service id as string
  date: string;
  time: string;
  address: string;
  area: string;
  notes: string;
  // Pricing parameters
  fabricType: string;
  garmentLength: string;
  designComplexity: string;
  liningRequired: string;
  handworkEmbroidery: string;
  trimsAccessories: string;
  fitAdjustments: string;
  fabricCost: string;
  urgency: string;
  specialRequirements: boolean;
}

interface ServiceOption { id: number; name: string }
interface AreaOption { id: number; name: string }

const timeSlots = [
  '09:00', '10:00', '11:00', '12:00',
  '14:00', '15:00', '16:00', '17:00'
];

export default function BookAppointment() {
  const [services, setServices] = useState<ServiceOption[]>([]);
  const [areas, setAreas] = useState<AreaOption[]>([]);
  const [formData, setFormData] = useState<AppointmentFormData>({
    name: '',
    email: '',
    phone: '',
    service: '',
    date: '',
    time: '',
    address: '',
    area: '',
    notes: '',
    // Pricing parameters with defaults
    fabricType: '',
    garmentLength: '',
    designComplexity: '',
    liningRequired: '',
    handworkEmbroidery: '',
    trimsAccessories: '',
    fitAdjustments: '',
    fabricCost: '',
    urgency: 'normal',
    specialRequirements: false
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load services for selection (id + name)
  useEffect(() => {
    const loadServices = async () => {
      try {
        const res = await apiRequest('/api/services/services/?page_size=100');
        if (res.ok) {
          const data = await res.json();
          type ApiService = { id: number; name: string };
          const list: ApiService[] = Array.isArray(data?.results) ? data.results : (Array.isArray(data) ? data as ApiService[] : []);
          setServices(list.map((s: ApiService) => ({ id: Number(s.id), name: String(s.name) })));
        }
      } catch {
        // ignore, user can still type
      }
    };
    const loadAreas = async () => {
      try {
        const data = await getPricingAreas();
        type ApiArea = { id: number; name: string };
        const list: ApiArea[] = Array.isArray(data?.results) ? data.results : (Array.isArray(data) ? data as ApiArea[] : []);
        setAreas(list.map((a: ApiArea) => ({ id: Number(a.id), name: String(a.name) })));
      } catch {
        // ignore
      }
    };
    loadServices();
    loadAreas();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Build payload expected by backend AppointmentCreateSerializer
      const payload = {
        service: Number(formData.service),
        scheduled_date: formData.date,
        scheduled_time: formData.time + ':00',
        duration_minutes: 60,
        notes: formData.notes,
        customer_data: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          area: formData.area || 'General',
        }
      };

      const appointmentResponse = await apiRequest('/api/appointments/appointments/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!appointmentResponse.ok) {
        const err = await appointmentResponse.json().catch(() => ({}));
        throw new Error(err?.detail || 'Failed to create appointment');
      }

      await appointmentResponse.json();
      
      setIsSubmitted(true);
    } catch (error) {
      console.error('Error booking appointment:', error);
      setError('Failed to book appointment. Please check your details and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Scissors className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Appointment Booked!</h1>
            <p className="text-lg text-gray-600 mb-6">
              Thank you for booking an appointment with SilaiWala. We&apos;ll contact you shortly to confirm the details.
            </p>
            <div className="bg-blue-50 rounded-lg p-6 mb-6">
              <h3 className="font-semibold text-gray-900 mb-2">Appointment Details:</h3>
              <p className="text-gray-700"><strong>Service:</strong> {formData.service}</p>
              <p className="text-gray-700"><strong>Date:</strong> {formData.date}</p>
              <p className="text-gray-700"><strong>Time:</strong> {formData.time}</p>
            </div>
            <button
              onClick={() => {
                setIsSubmitted(false);
                setFormData({
                  name: '',
                  email: '',
                  phone: '',
                  service: '',
                  date: '',
                  time: '',
                  address: '',
                  area: '',
                  notes: '',
                  fabricType: '',
                  garmentLength: '',
                  designComplexity: '',
                  liningRequired: '',
                  handworkEmbroidery: '',
                  trimsAccessories: '',
                  fitAdjustments: '',
                  fabricCost: '',
                  urgency: 'normal',
                  specialRequirements: false
                });
              }}
              className="btn btn-primary btn-lg"
            >
              Book Another Appointment
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Book Your Appointment</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Schedule a consultation and measurement session with our expert tailors
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Appointment Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Appointment Details</h2>
              {error && (
                <div className="mb-4 rounded bg-red-50 border border-red-200 p-3 text-red-700 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  {error}
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      <User className="inline h-4 w-4 mr-2" />
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      className="input"
                      placeholder="Enter your full name"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                      <Phone className="inline h-4 w-4 mr-2" />
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="input"
                      placeholder="Enter your phone number"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    <Mail className="inline h-4 w-4 mr-2" />
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="input"
                    placeholder="Enter your email address"
                  />
                </div>

                {/* Service Selection */}
                <div>
                  <label htmlFor="service" className="block text-sm font-medium text-gray-700 mb-2">
                    <Scissors className="inline h-4 w-4 mr-2" />
                    Service Required *
                  </label>
                  <select
                    id="service"
                    name="service"
                    required
                    value={formData.service}
                    onChange={handleInputChange}
                    className="input"
                  >
                    <option value="">Select a service</option>
                    {services.map((service) => (
                      <option key={service.id} value={String(service.id)}>
                        {service.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Area Selection for Pricing */}
                <div>
                  <label htmlFor="area" className="block text-sm font-medium text-gray-700 mb-2">
                    Pricing Area (for quote) *
                  </label>
                  <select
                    id="area"
                    name="area"
                    required
                    value={formData.area}
                    onChange={handleInputChange}
                    className="input"
                  >
                    <option value="">Select an area</option>
                    {areas.map((area) => (
                      <option key={area.id} value={String(area.id)}>
                        {area.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Garment Details Section */}
                <div className="border-t pt-6 mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Garment Details (Optional - for better pricing)</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Fabric Type */}
                    <div>
                      <label htmlFor="fabricType" className="block text-sm font-medium text-gray-700 mb-2">
                        Fabric Type
                      </label>
                      <select
                        id="fabricType"
                        name="fabricType"
                        value={formData.fabricType}
                        onChange={handleInputChange}
                        className="input"
                      >
                        <option value="">Select fabric type</option>
                        <option value="cotton">Cotton</option>
                        <option value="rayon">Rayon</option>
                        <option value="silk">Silk</option>
                        <option value="wool">Wool</option>
                        <option value="linen">Linen</option>
                        <option value="polyester">Polyester</option>
                        <option value="georgette">Georgette</option>
                        <option value="chiffon">Chiffon</option>
                      </select>
                    </div>

                    {/* Garment Length */}
                    <div>
                      <label htmlFor="garmentLength" className="block text-sm font-medium text-gray-700 mb-2">
                        Garment Length
                      </label>
                      <select
                        id="garmentLength"
                        name="garmentLength"
                        value={formData.garmentLength}
                        onChange={handleInputChange}
                        className="input"
                      >
                        <option value="">Select length</option>
                        <option value="short">Short</option>
                        <option value="medium">Medium</option>
                        <option value="long">Long</option>
                      </select>
                    </div>

                    {/* Design Complexity */}
                    <div>
                      <label htmlFor="designComplexity" className="block text-sm font-medium text-gray-700 mb-2">
                        Design Complexity
                      </label>
                      <select
                        id="designComplexity"
                        name="designComplexity"
                        value={formData.designComplexity}
                        onChange={handleInputChange}
                        className="input"
                      >
                        <option value="">Select complexity</option>
                        <option value="simple">Simple</option>
                        <option value="moderate">Moderate</option>
                        <option value="complex">Complex</option>
                      </select>
                    </div>

                    {/* Lining Required */}
                    <div>
                      <label htmlFor="liningRequired" className="block text-sm font-medium text-gray-700 mb-2">
                        Lining Required
                      </label>
                      <select
                        id="liningRequired"
                        name="liningRequired"
                        value={formData.liningRequired}
                        onChange={handleInputChange}
                        className="input"
                      >
                        <option value="">Select lining</option>
                        <option value="none">None</option>
                        <option value="partial">Partial</option>
                        <option value="full">Full</option>
                      </select>
                    </div>

                    {/* Handwork/Embroidery */}
                    <div>
                      <label htmlFor="handworkEmbroidery" className="block text-sm font-medium text-gray-700 mb-2">
                        Handwork/Embroidery
                      </label>
                      <select
                        id="handworkEmbroidery"
                        name="handworkEmbroidery"
                        value={formData.handworkEmbroidery}
                        onChange={handleInputChange}
                        className="input"
                      >
                        <option value="">Select handwork level</option>
                        <option value="none">None</option>
                        <option value="light">Light</option>
                        <option value="heavy">Heavy</option>
                      </select>
                    </div>

                    {/* Trims & Accessories */}
                    <div>
                      <label htmlFor="trimsAccessories" className="block text-sm font-medium text-gray-700 mb-2">
                        Trims & Accessories
                      </label>
                      <select
                        id="trimsAccessories"
                        name="trimsAccessories"
                        value={formData.trimsAccessories}
                        onChange={handleInputChange}
                        className="input"
                      >
                        <option value="">Select trims level</option>
                        <option value="minimal">Minimal</option>
                        <option value="moderate">Moderate</option>
                        <option value="heavy">Heavy</option>
                      </select>
                    </div>

                    {/* Fit Adjustments */}
                    <div>
                      <label htmlFor="fitAdjustments" className="block text-sm font-medium text-gray-700 mb-2">
                        Fit Adjustments Required
                      </label>
                      <select
                        id="fitAdjustments"
                        name="fitAdjustments"
                        value={formData.fitAdjustments}
                        onChange={handleInputChange}
                        className="input"
                      >
                        <option value="">Select adjustment level</option>
                        <option value="none">None</option>
                        <option value="minor">Minor (1-point)</option>
                        <option value="moderate">Moderate (2-3 points)</option>
                        <option value="major">Major (Full restructure)</option>
                      </select>
                    </div>

                    {/* Fabric Cost */}
                    <div>
                      <label htmlFor="fabricCost" className="block text-sm font-medium text-gray-700 mb-2">
                        Fabric Cost (₹)
                      </label>
                      <input
                        type="number"
                        id="fabricCost"
                        name="fabricCost"
                        value={formData.fabricCost}
                        onChange={handleInputChange}
                        className="input"
                        placeholder="Enter fabric cost"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>

                  {/* Urgency Level */}
                  <div className="mt-6">
                    <label htmlFor="urgency" className="block text-sm font-medium text-gray-700 mb-2">
                      Delivery Urgency
                    </label>
                    <select
                      id="urgency"
                      name="urgency"
                      value={formData.urgency}
                      onChange={handleInputChange}
                      className="input"
                    >
                      <option value="normal">Normal</option>
                      <option value="urgent">Urgent</option>
                      <option value="rush">Rush</option>
                    </select>
                  </div>

                  {/* Special Requirements */}
                  <div className="mt-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="specialRequirements"
                        checked={formData.specialRequirements}
                        onChange={handleInputChange}
                        className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        Special Requirements (e.g., custom patterns, unique materials)
                      </span>
                    </label>
                  </div>

                  {/* Live Smart Price Preview */}
                  {formData.service && formData.area && (
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Estimated Price:</span>
                        <PricePreview
                          serviceId={Number(formData.service)}
                          areaId={Number(formData.area)}
                          quantity={1}
                          urgency={formData.urgency as 'normal' | 'urgent' | 'rush'}
                          fabricType={formData.fabricType && formData.fabricType.trim() !== '' ? (formData.fabricType as 'cotton' | 'rayon' | 'silk' | 'wool' | 'linen' | 'polyester' | 'georgette' | 'chiffon') : undefined}
                          garmentLength={formData.garmentLength && formData.garmentLength.trim() !== '' ? (formData.garmentLength as 'short' | 'medium' | 'long') : undefined}
                          designComplexity={formData.designComplexity && formData.designComplexity.trim() !== '' ? (formData.designComplexity as 'simple' | 'moderate' | 'complex') : undefined}
                          liningRequired={formData.liningRequired && formData.liningRequired.trim() !== '' ? (formData.liningRequired as 'none' | 'partial' | 'full') : undefined}
                          handworkEmbroidery={formData.handworkEmbroidery && formData.handworkEmbroidery.trim() !== '' ? (formData.handworkEmbroidery as 'none' | 'light' | 'heavy') : undefined}
                          trimsAccessories={formData.trimsAccessories && formData.trimsAccessories.trim() !== '' ? (formData.trimsAccessories as 'minimal' | 'moderate' | 'heavy') : undefined}
                          fitAdjustments={formData.fitAdjustments && formData.fitAdjustments.trim() !== '' ? (formData.fitAdjustments as 'none' | 'minor' | 'moderate' | 'major') : undefined}
                          fabricCost={formData.fabricCost && formData.fabricCost.trim() !== '' ? parseFloat(formData.fabricCost) : undefined}
                          specialRequirements={formData.specialRequirements}
                          className="text-xl font-bold text-blue-600"
                        />
                      </div>
                      <p className="text-xs text-gray-600 mt-2">
                        Price updates automatically as you select options
                      </p>
                    </div>
                  )}
                </div>

                {/* Date and Time */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                      <Calendar className="inline h-4 w-4 mr-2" />
                      Preferred Date *
                    </label>
                    <input
                      type="date"
                      id="date"
                      name="date"
                      required
                      value={formData.date}
                      onChange={handleInputChange}
                      className="input"
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-2">
                      <Clock className="inline h-4 w-4 mr-2" />
                      Preferred Time *
                    </label>
                    <select
                      id="time"
                      name="time"
                      required
                      value={formData.time}
                      onChange={handleInputChange}
                      className="input"
                    >
                      <option value="">Select time</option>
                      {timeSlots.map((time) => (
                        <option key={time} value={time}>
                          {time}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Address */}
                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="inline h-4 w-4 mr-2" />
                    Address for Home Visit (Optional)
                  </label>
                  <textarea
                    id="address"
                    name="address"
                    rows={3}
                    value={formData.address}
                    onChange={handleInputChange}
                    className="input"
                    placeholder="Enter your address if you prefer home visit"
                  />
                </div>

                {/* Area and Additional Notes */}
                <div>
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Notes
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    rows={3}
                    value={formData.notes}
                    onChange={handleInputChange}
                    className="input"
                    placeholder="Any special requirements or notes"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn btn-primary btn-lg w-full"
                >
                  {isSubmitting ? 'Booking Appointment...' : 'Book Appointment'}
                </button>
              </form>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Why Choose Us */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Why Choose SilaiWala?</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3"></div>
                  <span className="text-gray-700">Expert tailors with 10+ years experience</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3"></div>
                  <span className="text-gray-700">Transparent pricing with no hidden costs</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3"></div>
                  <span className="text-gray-700">Guaranteed delivery timelines</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3"></div>
                  <span className="text-gray-700">Quality assurance on every garment</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3"></div>
                  <span className="text-gray-700">Home visit option available</span>
                </li>
              </ul>
            </div>

            {/* Contact Info */}
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Need Help?</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <Phone className="h-5 w-5 text-blue-600 mr-3" />
                  <span className="text-gray-700">+91 98765 43210</span>
                </div>
                <div className="flex items-center">
                  <Mail className="h-5 w-5 text-blue-600 mr-3" />
                  <span className="text-gray-700">info@silaiwala.com</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-blue-600 mr-3" />
                  <span className="text-gray-700">Mon-Sat: 9AM-7PM</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
