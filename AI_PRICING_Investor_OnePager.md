# SilaiWala AI_PRICING — Investor One-Pager

## Problem
- Tailoring prices are opaque and manual, causing cart drop-offs, underpricing, and margin leakage.
- Lack of real-time, context-aware pricing leads to inconsistent customer experience and lost revenue.

## Solution
- AI-powered dynamic pricing that personalizes quotes in real-time.
- Blends business rules with machine learning to produce fair, explainable prices.

## Business Impact (Modeled)
- +8–15% revenue uplift via optimal pricing
- +3–7% margin improvement by reducing underpricing
- -10–20% drop in quote-to-booking abandonment (transparent, upfront estimates)
- 100% pricing coverage at scale without manual effort

## How It Works
1. Data: Services, areas, historical orders, and past prices
2. ML Model: RandomForest regressor predicts fair price from factors
3. Rules Engine: Guardrails (peak season, bulk discounts, VIP tiers)
4. Price: Base × area multiplier blended with ML prediction + rules
5. Learning: Orders feed history; retraining improves accuracy over time

## Why Now / Differentiation
- Tailoring is underserved by pricing tech but has high variance (fit, fabric, urgency).
- Vertical-specific features (measurement complexity, fabric handling, turnaround time).
- Hybrid approach (rules + ML) yields explainable and safe pricing.

## Core Features
- Real-time price estimation API (live in product)
- **10 Comprehensive Pricing Factors**:
  - Seasonal demand, fabric complexity, garment length
  - Design complexity, lining requirements, handwork/embroidery
  - Trims & accessories, fit adjustments, customer loyalty, urgency
- **8 Business Rules**: Peak season, bulk discounts, silk premium, embroidery premium, lining premium, complex design premium, VIP discounts, rush delivery
- Area-based multipliers
- Confidence scoring and price breakdown (explainability)
- Analytics: factor impact, price trends, model performance

## Proof Points (Demo-Ready)
- Preloaded: **10 pricing factors, 8 business rules, 50+ historical records**
- Live endpoints:
  - POST /api/ai-pricing/calculate-price/
  - GET  /api/ai-pricing/analytics/
  - GET  /api/ai-pricing/factors/
- Frontend booking shows instant "Estimated Price" as user selects service + area
- **Garment-specific pricing**: Blouse (₹350-700), Kurti (₹500-900), Dress (₹1000-2500), Lehenga (₹1200-3000)

## Example Response (Abridged)
```json
{
  "status": "success",
  "base_price": 800.0,
  "calculated_price": 1600.0,
  "confidence_score": 0.30,
  "factors_applied": { 
    "seasonal": "Peak season", 
    "fabric": "Silk premium", 
    "handwork": "Heavy embroidery",
    "volume": "Bulk (2)" 
  }
}
```

## Detailed Pricing Parameters
**Garment Complexity Factors** (with impact multipliers):
- **Fabric Type**: Cotton (base), Rayon (+10%), Silk (+30%)
- **Design Complexity**: Simple (base), Moderate (+15%), Complex (+50%)
- **Lining**: None (base), Partial (+10%), Full (+30%)
- **Handwork**: None (base), Light (+10%), Heavy (+40%)
- **Garment Length**: Short (base), Medium (+10%), Long (+20%)
- **Trims**: Minimal (base), Moderate (+10%), Heavy (+20%)
- **Fit Adjustments**: 1-point (base), 2-3 points (+10%), Full restructure (+50%)

**Time-Based Pricing Formula**:
`Final Price = Base Price + (Time Required × Hourly Rate) + Material Add-ons`

## KPIs to Track
- Quote-to-booking conversion (pre vs post)
- Average realized price vs list price
- Margin variance reduction week-over-week
- Model confidence distribution and drift

## Technical Overview
- Backend: Django + DRF, PostgreSQL, Redis
- AI: scikit-learn (RandomForest), joblib model persistence
- Frontend: Next.js; live price via `/api/ai-pricing/calculate-price/`
- Ops: Dockerized services; admin UI to manage rules/factors
- Security: Rule caps, audit logs, CORS/CSRF for verified domains

## Roadmap (Next 2–3 Quarters)
- Q1: A/B testing for price elasticity, automated retraining pipeline
- Q2: Segment-aware pricing (new/returning/VIP), demand forecasting
- Q3: Competitor-aware pricing and promotions optimizer

## Moat
- Proprietary labeled data (service × area × context) improves fit over time
- Workflow integration (booking + measurements) yields continuous data advantage
- Explainable pricing builds trust; resilient hybrid (rules + ML)

## Demo Script (60–90s)
1) Open booking page → Select Service + Area → instant “Estimated Price”
2) Toggle urgency/quantity → watch price update
3) Show analytics endpoint (factor weights, recent record)
4) Explain confidence and rules applied (explainability)

---

Contact: team@silaiwala.com | Ask: Funding to scale dataset, forecasting module, multi-city pilots; Targets: +10% revenue, -15% abandonment in 3 months across 3 cities.
