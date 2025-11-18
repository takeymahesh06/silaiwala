'use client';

import { useEffect, useState } from 'react';
import { getSmartPrice, type PriceRequest, type PriceResponse } from '@/lib/pricing';

type Props = {
  serviceId: number;
  areaId: number;
  quantity?: number;
  urgency?: 'normal' | 'urgent' | 'rush';
  customerId?: number;
  className?: string;
  // New pricing parameters
  fabricType?: 'cotton' | 'rayon' | 'silk' | 'wool' | 'linen' | 'polyester' | 'georgette' | 'chiffon';
  garmentLength?: 'short' | 'medium' | 'long';
  designComplexity?: 'simple' | 'moderate' | 'complex';
  liningRequired?: 'none' | 'partial' | 'full';
  handworkEmbroidery?: 'none' | 'light' | 'heavy';
  trimsAccessories?: 'minimal' | 'moderate' | 'heavy';
  fitAdjustments?: 'none' | 'minor' | 'moderate' | 'major';
  fabricCost?: number;
  specialRequirements?: boolean;
};

export default function PricePreview({ 
  serviceId, 
  areaId, 
  quantity = 1, 
  urgency = 'normal', 
  customerId, 
  className,
  fabricType,
  garmentLength,
  designComplexity,
  liningRequired,
  handworkEmbroidery,
  trimsAccessories,
  fitAdjustments,
  fabricCost,
  specialRequirements
}: Props) {
  const [price, setPrice] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (!serviceId || !areaId) return;
      setLoading(true);
      setError(null);
      
      // Build order context with all parameters
      const orderContext: PriceRequest['order_context'] = {
        quantity,
        urgency,
      };
      
      // Add optional parameters if provided (use truthy check and ensure non-empty strings)
      if (fabricType && fabricType.trim() !== '') orderContext.fabric_type = fabricType;
      if (garmentLength && garmentLength.trim() !== '') orderContext.garment_length = garmentLength;
      if (designComplexity && designComplexity.trim() !== '') orderContext.design_complexity = designComplexity;
      if (liningRequired && liningRequired.trim() !== '') orderContext.lining_required = liningRequired;
      if (handworkEmbroidery && handworkEmbroidery.trim() !== '') orderContext.handwork_embroidery = handworkEmbroidery;
      if (trimsAccessories && trimsAccessories.trim() !== '') orderContext.trims_accessories = trimsAccessories;
      if (fitAdjustments && fitAdjustments.trim() !== '') orderContext.fit_adjustments = fitAdjustments;
      // Include fabric cost even if 0, but exclude if undefined/null/NaN
      if (fabricCost !== undefined && fabricCost !== null && !isNaN(fabricCost)) {
        orderContext.fabric_cost = fabricCost;
      }
      if (specialRequirements !== undefined) {
        orderContext.special_requirements = specialRequirements;
      }
      
      const payload: PriceRequest = {
        service_id: serviceId,
        area_id: areaId,
        customer_id: customerId,
        order_context: orderContext,
      };
      
      try {
        const res: PriceResponse = await getSmartPrice(payload);
        if (!cancelled) {
          if (res.status === 'success' && typeof res.calculated_price === 'number') {
            setPrice(res.calculated_price);
          } else {
            setError(res.message || 'Unable to calculate price');
          }
        }
      } catch {
        if (!cancelled) setError('Unable to calculate price');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    
    // Add a small delay to debounce rapid changes
    const timeoutId = setTimeout(() => {
      run();
    }, 300);
    
    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [
    serviceId, 
    areaId, 
    quantity, 
    urgency, 
    customerId,
    fabricType,
    garmentLength,
    designComplexity,
    liningRequired,
    handworkEmbroidery,
    trimsAccessories,
    fitAdjustments,
    fabricCost,
    specialRequirements
  ]);

  if (!serviceId || !areaId) return null;

  return (
    <div className={className}>
      {loading && <span>Calculating price...</span>}
      {!loading && error && <span className="text-red-600">{error}</span>}
      {!loading && !error && price !== null && <span className="font-semibold">₹ {price}</span>}
    </div>
  );
}
