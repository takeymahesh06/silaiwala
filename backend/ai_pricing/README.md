# 🤖 AI-Powered Smart Pricing System for SilaiWala

## Overview

The Smart Pricing & Cost Estimation system uses machine learning and business rules to dynamically calculate optimal prices for tailoring services. It considers multiple factors like seasonal demand, customer loyalty, service complexity, and market conditions to provide intelligent pricing recommendations.

## 🚀 Features

### Core Capabilities
- **Dynamic Price Calculation**: Real-time pricing based on multiple factors
- **Machine Learning Models**: Trained on historical data for accurate predictions
- **Business Rules Engine**: Configurable rules for pricing adjustments
- **Customer Segmentation**: Personalized pricing based on customer profiles
- **Seasonal Adjustments**: Automatic pricing changes based on seasons
- **Confidence Scoring**: ML model confidence indicators
- **Pricing Analytics**: Comprehensive insights and recommendations

### AI/ML Components
- **Random Forest Regressor**: Primary ML model for price prediction
- **Gradient Boosting**: Alternative model for comparison
- **Feature Engineering**: Automatic feature extraction and scaling
- **Model Training**: Automated retraining with new data
- **Prediction Confidence**: Uncertainty quantification

## 📁 Project Structure

```
backend/ai_pricing/
├── models.py                 # Database models
├── views.py                  # API endpoints
├── urls.py                   # URL routing
├── admin.py                  # Django admin configuration
├── services/
│   ├── pricing_ml.py         # ML algorithms and training
│   └── pricing_calculator.py # Main pricing service
├── management/commands/
│   └── populate_pricing_data.py # Data population command
└── models/                   # Saved ML models (auto-created)
```

## 🛠️ Installation & Setup

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Run Migrations
```bash
python manage.py makemigrations ai_pricing
python manage.py migrate
```

### 3. Populate Initial Data
```bash
python manage.py populate_pricing_data --all
```

### 4. Train Initial Model
```bash
# This will be done via API call
curl -X POST http://localhost:8000/api/ai-pricing/train-model/
```

## 🔧 API Endpoints

### Core Pricing Endpoints

#### Calculate Dynamic Price
```http
POST /api/ai-pricing/calculate-price/
Content-Type: application/json

{
    "service_id": 1,
    "area_id": 1,
    "customer_id": 1,
    "order_context": {
        "quantity": 2,
        "urgency": "normal",
        "fabric_cost": 500
    }
}
```

**Response:**
```json
{
    "status": "success",
    "service_id": 1,
    "area_id": 1,
    "base_price": 1500.00,
    "calculated_price": 1800.00,
    "price_multiplier": 1.2,
    "confidence_score": 0.85,
    "factors_applied": {
        "difficulty": "intermediate level service",
        "seasonal": "Peak season pricing",
        "customer": "VIP customer discount"
    },
    "breakdown": {
        "base_price": 1500.00,
        "ml_adjustment": 200.00,
        "customer_adjustment": -150.00,
        "seasonal_adjustment": 1.3,
        "final_price": 1800.00
    }
}
```

#### Get Service Pricing Across Areas
```http
GET /api/ai-pricing/service/1/pricing/
```

#### Get Pricing Recommendations
```http
GET /api/ai-pricing/service/1/recommendations/
```

### ML Model Endpoints

#### Train Pricing Model
```http
POST /api/ai-pricing/train-model/
```

#### Get Pricing Analytics
```http
GET /api/ai-pricing/analytics/
```

### Data Management Endpoints

#### Get Pricing Factors
```http
GET /api/ai-pricing/factors/
```

#### Get Pricing History
```http
GET /api/ai-pricing/history/?service_id=1&limit=20
```

#### Get Customer Profile
```http
GET /api/ai-pricing/customer/1/profile/
```

## 🧠 Machine Learning Models

### Features Used
- **Service Features**: Difficulty level, estimated days, category
- **Area Features**: Pricing multiplier, location characteristics
- **Customer Features**: Loyalty tier, order history, payment reliability
- **Context Features**: Season, urgency, order volume, fabric cost
- **Historical Features**: Success rate, complexity score

### Model Performance
- **Random Forest**: Primary model with good interpretability
- **Gradient Boosting**: Alternative for comparison
- **Linear Regression**: Baseline model
- **Ridge Regression**: Regularized linear model

### Training Process
1. **Data Collection**: Historical pricing data from orders
2. **Feature Engineering**: Extract and transform features
3. **Model Training**: Train multiple models and select best
4. **Validation**: Cross-validation for performance metrics
5. **Deployment**: Save trained models for production use

## 📊 Pricing Factors

### Core Factors
1. **Seasonal Demand** (Weight: 0.3)
   - Peak season: +30% pricing
   - Off season: -20% pricing
   - Normal season: Base pricing

2. **Fabric Complexity** (Weight: 0.25)
   - Simple fabrics: Base pricing
   - Complex fabrics: +40% pricing
   - Premium fabrics: +60% pricing

3. **Customer Loyalty** (Weight: 0.2)
   - New customers: Base pricing
   - Regular customers: -5% discount
   - VIP customers: -15% discount

4. **Urgency Level** (Weight: 0.15)
   - Normal delivery: Base pricing
   - Urgent delivery: +50% pricing
   - Rush delivery: +100% pricing

5. **Required Skill Level** (Weight: 0.1)
   - Basic services: Base pricing
   - Expert services: +80% pricing

## 🎯 Business Rules

### Automatic Rules
- **Peak Season**: 30% increase during wedding/festival seasons
- **Bulk Orders**: 10% discount for 5+ items, 15% for 10+ items
- **Expert Services**: 50% increase for expert-level services
- **VIP Customers**: 15% discount for VIP customers

### Configurable Rules
Rules can be added/modified through Django admin or API:
```json
{
    "name": "Weekend Premium",
    "rule_type": "if_then",
    "condition": {
        "field": "is_weekend",
        "operator": "equals",
        "value": true
    },
    "action": {
        "type": "multiply",
        "value": 1.2
    },
    "priority": 5
}
```

## 📈 Analytics & Insights

### Pricing Analytics
- **Price Trends**: Historical price movements
- **Factor Impact**: Which factors most influence pricing
- **Model Performance**: ML model accuracy metrics
- **Revenue Impact**: Potential revenue changes from pricing

### Customer Analytics
- **Loyalty Segmentation**: Customer tier distribution
- **Purchase Patterns**: Order frequency and value trends
- **Price Sensitivity**: Customer response to price changes

## 🔄 Integration Points

### Order System Integration
```python
# In your order creation view
from ai_pricing.services.pricing_calculator import SmartPricingService

pricing_service = SmartPricingService()
price_result = pricing_service.calculate_dynamic_price(
    service_id=service.id,
    area_id=area.id,
    customer_id=customer.id,
    order_context={'quantity': quantity}
)

# Use price_result['calculated_price'] for order total
```

### Frontend Integration
```javascript
// Calculate price before showing to customer
const response = await fetch('/api/ai-pricing/calculate-price/', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({
        service_id: selectedService,
        area_id: selectedArea,
        customer_id: customerId,
        order_context: {
            quantity: quantity,
            urgency: urgency
        }
    })
});

const priceData = await response.json();
if (priceData.status === 'success') {
    displayPrice(priceData.calculated_price);
}
```

## 🚀 Usage Examples

### Basic Price Calculation
```python
from ai_pricing.services.pricing_calculator import SmartPricingService

pricing_service = SmartPricingService()
result = pricing_service.calculate_dynamic_price(
    service_id=1,
    area_id=1,
    customer_id=1
)

print(f"Base Price: ₹{result['base_price']}")
print(f"Calculated Price: ₹{result['calculated_price']}")
print(f"Confidence: {result['confidence_score']:.2f}")
```

### Get Pricing Recommendations
```python
from ai_pricing.services.pricing_ml import PricingOptimizationService

optimization_service = PricingOptimizationService()
recommendations = optimization_service.optimize_pricing_for_service(service_id=1)

for area, data in recommendations['optimized_prices'].items():
    print(f"{area}: ₹{data['optimized_price']} (Confidence: {data['confidence']:.2f})")
```

## 🔧 Configuration

### Environment Variables
```bash
# Optional: ML model configuration
ML_MODEL_VERSION=v1.0
ML_CONFIDENCE_THRESHOLD=0.7
ML_RETRAIN_FREQUENCY=30  # days
```

### Django Settings
```python
# Add to settings.py
AI_PRICING_SETTINGS = {
    'MODEL_VERSION': 'v1.0',
    'CONFIDENCE_THRESHOLD': 0.7,
    'AUTO_RETRAIN': True,
    'RETRAIN_FREQUENCY_DAYS': 30,
}
```

## 📝 Monitoring & Maintenance

### Model Performance Monitoring
- **Accuracy Metrics**: MAE, MSE, R2 score tracking
- **Prediction Confidence**: Monitor confidence score distribution
- **Data Drift**: Detect changes in input data patterns
- **Business Impact**: Track revenue and customer satisfaction

### Regular Maintenance
1. **Weekly**: Review pricing analytics and factor performance
2. **Monthly**: Retrain models with new data
3. **Quarterly**: Review and update business rules
4. **Annually**: Comprehensive model evaluation and updates

## 🎯 Future Enhancements

### Planned Features
- **Real-time Market Analysis**: Integration with competitor pricing
- **Advanced ML Models**: Deep learning for complex patterns
- **A/B Testing**: Automated pricing experiments
- **Demand Forecasting**: Predict future demand patterns
- **Dynamic Inventory**: Optimize service availability

### Integration Opportunities
- **CRM Integration**: Enhanced customer segmentation
- **Inventory Management**: Dynamic service availability
- **Marketing Automation**: Personalized pricing campaigns
- **Business Intelligence**: Advanced analytics dashboard

## 🤝 Support & Contributing

### Getting Help
- Check the API documentation for endpoint details
- Review the Django admin for data management
- Use the management commands for data operations

### Contributing
1. Follow Django best practices
2. Add tests for new features
3. Update documentation for changes
4. Use type hints for better code clarity

---

**Built with ❤️ for SilaiWala - Smart Tailoring Solutions**
