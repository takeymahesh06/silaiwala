export type PriceRequest = {
  service_id: number;
  area_id: number;
  customer_id?: number;
  order_context?: {
    quantity?: number;
    urgency?: 'normal' | 'urgent' | 'rush';
    fabric_cost?: number;
    special_requirements?: boolean;
    // New pricing parameters
    fabric_type?: 'cotton' | 'rayon' | 'silk' | 'wool' | 'linen' | 'polyester' | 'georgette' | 'chiffon';
    garment_length?: 'short' | 'medium' | 'long';
    design_complexity?: 'simple' | 'moderate' | 'complex';
    lining_required?: 'none' | 'partial' | 'full';
    handwork_embroidery?: 'none' | 'light' | 'heavy';
    trims_accessories?: 'minimal' | 'moderate' | 'heavy';
    fit_adjustments?: 'none' | 'minor' | 'moderate' | 'major';
  };
};

export type PriceResponse = {
  status: 'success' | 'error';
  service_id?: number;
  area_id?: number;
  base_price?: number;
  calculated_price?: number;
  price_multiplier?: number;
  confidence_score?: number;
  factors_applied?: Record<string, unknown>;
  message?: string;
};

import { apiRequest } from './api';

export async function getSmartPrice(payload: PriceRequest): Promise<PriceResponse> {
  const res = await apiRequest('/api/ai-pricing/calculate-price/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    return { status: 'error', message: err?.message || 'Pricing API failed' };
  }
  return res.json();
}

export async function getPricingAnalytics() {
  const res = await apiRequest('/api/ai-pricing/analytics/');
  if (!res.ok) throw new Error('Failed to load pricing analytics');
  return res.json();
}

export async function getPricingFactors() {
  const res = await apiRequest('/api/ai-pricing/factors/');
  if (!res.ok) throw new Error('Failed to load pricing factors');
  return res.json();
}

export async function getPricingAreas() {
  const res = await apiRequest('/api/services/areas/');
  if (!res.ok) throw new Error('Failed to load areas');
  return res.json();
}

export async function getServicePricing(serviceId: number) {
  const res = await apiRequest(`/api/ai-pricing/service/${serviceId}/pricing/`);
  if (!res.ok) throw new Error('Failed to load service pricing');
  return res.json();
}
