import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.linear_model import LinearRegression, Ridge
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from django.db.models import Avg, Count, Q
from django.utils import timezone
from datetime import datetime, timedelta
import json
import logging
from typing import Dict, List, Tuple, Optional
import joblib
import os

from services.models import Service, ServicePricing, PricingArea
from orders.models import Order, OrderItem
from appointments.models import Customer
from ..models import (
    PricingFactor, PricingRule, PricingHistory, 
    DynamicPricing, PricingPrediction, CustomerPricingProfile
)

logger = logging.getLogger(__name__)


class PricingMLService:
    """Machine Learning service for dynamic pricing"""
    
    def __init__(self):
        self.models = {}
        self.scalers = {}
        self.label_encoders = {}
        self.model_version = "v1.0"
        
    def prepare_training_data(self) -> pd.DataFrame:
        """Prepare training data from historical pricing"""
        try:
            # Get historical pricing data
            pricing_history = PricingHistory.objects.all()
            
            if not pricing_history.exists():
                logger.warning("No historical pricing data available for training")
                return pd.DataFrame()
            
            data = []
            for record in pricing_history:
                data.append({
                    'service_id': record.service.id,
                    'service_category': record.service.category.name,
                    'service_difficulty': record.service.difficulty_level,
                    'area_id': record.area.id,
                    'base_price': float(record.base_price),
                    'final_price': float(record.final_price),
                    'order_volume': record.order_volume,
                    'fabric_cost': float(record.fabric_cost) if record.fabric_cost else 0,
                    'complexity_score': record.complexity_score or 0,
                    'success_rate': record.success_rate or 0.8,
                    'season': record.season or 'normal',
                    'customer_segment': record.customer_segment or 'regular',
                    'created_month': record.created_at.month,
                    'created_year': record.created_at.year,
                })
            
            df = pd.DataFrame(data)
            
            # Add derived features
            df['price_ratio'] = df['final_price'] / df['base_price']
            df['is_peak_season'] = df['season'].isin(['wedding', 'festival', 'holiday'])
            df['is_high_difficulty'] = df['service_difficulty'].isin(['advanced', 'expert'])
            
            return df
            
        except Exception as e:
            logger.error(f"Error preparing training data: {str(e)}")
            return pd.DataFrame()
    
    def train_pricing_model(self) -> Dict:
        """Train ML models for pricing prediction"""
        try:
            df = self.prepare_training_data()
            
            if df.empty or len(df) < 10:
                logger.warning("Insufficient data for training")
                return {'status': 'insufficient_data'}
            
            # Prepare features and target
            feature_columns = [
                'service_id', 'service_difficulty', 'area_id', 'base_price',
                'order_volume', 'fabric_cost', 'complexity_score', 'success_rate',
                'created_month', 'price_ratio', 'is_peak_season', 'is_high_difficulty'
            ]
            
            X = df[feature_columns].copy()
            y = df['final_price']
            
            # Encode categorical variables
            categorical_columns = ['service_difficulty']
            for col in categorical_columns:
                if col in X.columns:
                    le = LabelEncoder()
                    X[col] = le.fit_transform(X[col].astype(str))
                    self.label_encoders[col] = le
            
            # Split data
            X_train, X_test, y_train, y_test = train_test_split(
                X, y, test_size=0.2, random_state=42
            )
            
            # Scale features
            scaler = StandardScaler()
            X_train_scaled = scaler.fit_transform(X_train)
            X_test_scaled = scaler.transform(X_test)
            self.scalers['pricing'] = scaler
            
            # Train multiple models
            models = {
                'random_forest': RandomForestRegressor(n_estimators=100, random_state=42),
                'gradient_boosting': GradientBoostingRegressor(random_state=42),
                'ridge': Ridge(alpha=1.0),
                'linear': LinearRegression()
            }
            
            results = {}
            for name, model in models.items():
                model.fit(X_train_scaled, y_train)
                y_pred = model.predict(X_test_scaled)
                
                mae = mean_absolute_error(y_test, y_pred)
                mse = mean_squared_error(y_test, y_pred)
                r2 = r2_score(y_test, y_pred)
                
                results[name] = {
                    'mae': mae,
                    'mse': mse,
                    'r2': r2,
                    'model': model
                }
                
                logger.info(f"{name} - MAE: {mae:.2f}, R2: {r2:.2f}")
            
            # Select best model based on R2 score
            best_model_name = max(results.keys(), key=lambda k: results[k]['r2'])
            best_model = results[best_model_name]['model']
            
            self.models['pricing'] = best_model
            
            # Save model
            self.save_model()
            
            return {
                'status': 'success',
                'best_model': best_model_name,
                'metrics': results[best_model_name],
                'all_results': results
            }
            
        except Exception as e:
            logger.error(f"Error training pricing model: {str(e)}")
            return {'status': 'error', 'message': str(e)}
    
    def predict_price(self, service_id: int, area_id: int, 
                     additional_features: Dict = None) -> Dict:
        """Predict optimal price for a service"""
        try:
            if 'pricing' not in self.models:
                # Try to load existing model
                if not self.load_model():
                    return {'status': 'no_model', 'message': 'No trained model available'}
            
            service = Service.objects.get(id=service_id)
            area = PricingArea.objects.get(id=area_id)
            
            # Get base pricing
            try:
                base_pricing = ServicePricing.objects.get(service=service, area=area)
                base_price = float(base_pricing.base_price)
            except ServicePricing.DoesNotExist:
                base_price = 1000.0  # Default base price
            
            # Prepare features
            features = {
                'service_id': service_id,
                'service_difficulty': service.difficulty_level,
                'area_id': area_id,
                'base_price': base_price,
                'order_volume': 1,
                'fabric_cost': 0,
                'complexity_score': self._calculate_complexity_score(service),
                'success_rate': 0.8,
                'created_month': timezone.now().month,
                'price_ratio': 1.0,
                'is_peak_season': self._is_peak_season(),
                'is_high_difficulty': service.difficulty_level in ['advanced', 'expert'],
                # New parameters with defaults
                'fabric_type': 'cotton',
                'garment_length': 'medium',
                'design_complexity': 'simple',
                'lining_required': 'none',
                'handwork_embroidery': 'none',
                'trims_accessories': 'minimal',
                'fit_adjustments': 'none',
                'urgency_level': 'normal',
                'special_requirements': False
            }
            
            # Add additional features if provided (this will override defaults)
            if additional_features:
                features.update(additional_features)
            
            # Convert to DataFrame
            feature_df = pd.DataFrame([features])
            
            # Encode categorical variables
            for col, encoder in self.label_encoders.items():
                if col in feature_df.columns:
                    feature_df[col] = encoder.transform(feature_df[col].astype(str))
            
            # Scale features
            if 'pricing' in self.scalers:
                scaled_features = self.scalers['pricing'].transform(feature_df)
            else:
                scaled_features = feature_df.values
            
            # Make prediction
            predicted_price = self.models['pricing'].predict(scaled_features)[0]
            
            # Apply business rules
            final_price = self._apply_pricing_rules(service, area, predicted_price, features)
            
            # Calculate confidence score
            confidence = self._calculate_confidence_score(features)
            
            return {
                'status': 'success',
                'predicted_price': round(predicted_price, 2),
                'final_price': round(final_price, 2),
                'base_price': base_price,
                'confidence_score': confidence,
                'price_multiplier': round(final_price / base_price, 2),
                'factors_applied': self._get_applied_factors(features)
            }
            
        except Exception as e:
            logger.error(f"Error predicting price: {str(e)}")
            return {'status': 'error', 'message': str(e)}
    
    def _calculate_complexity_score(self, service: Service) -> float:
        """Calculate complexity score for a service"""
        difficulty_scores = {
            'basic': 1.0,
            'intermediate': 2.0,
            'advanced': 3.0,
            'expert': 4.0
        }
        
        base_score = difficulty_scores.get(service.difficulty_level, 1.0)
        
        # Adjust based on estimated days
        if service.estimated_days > 7:
            base_score += 0.5
        elif service.estimated_days > 14:
            base_score += 1.0
        
        return min(base_score, 5.0)  # Cap at 5.0
    
    def _is_peak_season(self) -> bool:
        """Check if current time is peak season"""
        current_month = timezone.now().month
        
        # Peak seasons: Wedding season (Oct-Dec), Festival season (Aug-Nov)
        peak_months = [8, 9, 10, 11, 12]
        return current_month in peak_months
    
    def _apply_pricing_rules(self, service: Service, area: PricingArea, 
                           predicted_price: float, features: Dict) -> float:
        """Apply business rules to predicted price"""
        try:
            rules = PricingRule.objects.filter(is_active=True).order_by('-priority')
            
            final_price = predicted_price
            
            for rule in rules:
                if self._evaluate_rule_condition(rule.condition, features):
                    final_price = self._apply_rule_action(rule.action, final_price)
            
            # Ensure price is within reasonable bounds
            min_price = predicted_price * 0.7  # Minimum 70% of predicted
            max_price = predicted_price * 1.5  # Maximum 150% of predicted
            
            final_price = max(min_price, min(final_price, max_price))
            
            return final_price
            
        except Exception as e:
            logger.error(f"Error applying pricing rules: {str(e)}")
            return predicted_price
    
    def _evaluate_rule_condition(self, condition: Dict, features: Dict) -> bool:
        """Evaluate if a rule condition is met"""
        try:
            # Simple condition evaluation (can be extended)
            field = condition.get('field')
            operator = condition.get('operator')
            value = condition.get('value')
            
            if field not in features:
                return False
            
            feature_value = features[field]
            
            if operator == 'equals':
                return feature_value == value
            elif operator == 'greater_than':
                return feature_value > value
            elif operator == 'less_than':
                return feature_value < value
            elif operator == 'in':
                return feature_value in value
            
            return False
            
        except Exception as e:
            logger.error(f"Error evaluating rule condition: {str(e)}")
            return False
    
    def _apply_rule_action(self, action: Dict, current_price: float) -> float:
        """Apply rule action to current price"""
        try:
            action_type = action.get('type')
            value = action.get('value', 0)
            
            if action_type == 'multiply':
                return current_price * value
            elif action_type == 'add':
                return current_price + value
            elif action_type == 'percentage':
                return current_price * (1 + value / 100)
            
            return current_price
            
        except Exception as e:
            logger.error(f"Error applying rule action: {str(e)}")
            return current_price
    
    def _calculate_confidence_score(self, features: Dict) -> float:
        """Calculate confidence score for the prediction"""
        try:
            # Simple confidence calculation based on data availability
            confidence = 0.5  # Base confidence
            
            # Increase confidence based on available features
            if features.get('complexity_score', 0) > 0:
                confidence += 0.1
            if features.get('fabric_cost', 0) > 0:
                confidence += 0.1
            if features.get('success_rate', 0) > 0:
                confidence += 0.1
            
            # Decrease confidence for edge cases
            if features.get('is_peak_season', False):
                confidence -= 0.1  # Less predictable during peak season
            
            return max(0.1, min(1.0, confidence))
            
        except Exception as e:
            logger.error(f"Error calculating confidence score: {str(e)}")
            return 0.5
    
    def _get_applied_factors(self, features: Dict) -> Dict:
        """Get factors that influenced the pricing"""
        factors = {}
        
        if features.get('is_peak_season', False):
            factors['seasonal_demand'] = 'high'
        
        if features.get('is_high_difficulty', False):
            factors['complexity'] = 'high'
        
        if features.get('complexity_score', 0) > 3:
            factors['skill_requirement'] = 'expert'
        
        return factors
    
    def save_model(self):
        """Save trained models to disk"""
        try:
            model_dir = os.path.join(os.path.dirname(__file__), 'models')
            os.makedirs(model_dir, exist_ok=True)
            
            for name, model in self.models.items():
                model_path = os.path.join(model_dir, f'{name}_{self.model_version}.joblib')
                joblib.dump(model, model_path)
            
            # Save scalers and encoders
            scaler_path = os.path.join(model_dir, f'scalers_{self.model_version}.joblib')
            joblib.dump(self.scalers, scaler_path)
            
            encoder_path = os.path.join(model_dir, f'encoders_{self.model_version}.joblib')
            joblib.dump(self.label_encoders, encoder_path)
            
            logger.info("Models saved successfully")
            
        except Exception as e:
            logger.error(f"Error saving models: {str(e)}")
    
    def load_model(self) -> bool:
        """Load trained models from disk"""
        try:
            model_dir = os.path.join(os.path.dirname(__file__), 'models')
            
            if not os.path.exists(model_dir):
                return False
            
            # Load models
            for filename in os.listdir(model_dir):
                if filename.startswith('pricing_') and filename.endswith('.joblib'):
                    model_path = os.path.join(model_dir, filename)
                    self.models['pricing'] = joblib.load(model_path)
                    break
            
            # Load scalers and encoders
            scaler_path = os.path.join(model_dir, f'scalers_{self.model_version}.joblib')
            if os.path.exists(scaler_path):
                self.scalers = joblib.load(scaler_path)
            
            encoder_path = os.path.join(model_dir, f'encoders_{self.model_version}.joblib')
            if os.path.exists(encoder_path):
                self.label_encoders = joblib.load(encoder_path)
            
            logger.info("Models loaded successfully")
            return True
            
        except Exception as e:
            logger.error(f"Error loading models: {str(e)}")
            return False


class PricingOptimizationService:
    """Service for optimizing pricing strategies"""
    
    def __init__(self):
        self.ml_service = PricingMLService()
    
    def optimize_pricing_for_service(self, service_id: int) -> Dict:
        """Optimize pricing for a specific service across all areas"""
        try:
            service = Service.objects.get(id=service_id)
            areas = PricingArea.objects.filter(is_active=True)
            
            optimized_prices = {}
            
            for area in areas:
                prediction = self.ml_service.predict_price(service_id, area.id)
                
                if prediction['status'] == 'success':
                    optimized_prices[area.name] = {
                        'area_id': area.id,
                        'current_price': self._get_current_price(service, area),
                        'optimized_price': prediction['final_price'],
                        'confidence': prediction['confidence_score'],
                        'potential_revenue': self._calculate_revenue_impact(
                            service, area, prediction['final_price']
                        )
                    }
            
            return {
                'status': 'success',
                'service': service.name,
                'optimized_prices': optimized_prices,
                'recommendations': self._generate_recommendations(optimized_prices)
            }
            
        except Exception as e:
            logger.error(f"Error optimizing pricing: {str(e)}")
            return {'status': 'error', 'message': str(e)}
    
    def _get_current_price(self, service: Service, area: PricingArea) -> float:
        """Get current price for service in area"""
        try:
            pricing = ServicePricing.objects.get(service=service, area=area)
            return float(pricing.final_price)
        except ServicePricing.DoesNotExist:
            return 0.0
    
    def _calculate_revenue_impact(self, service: Service, area: PricingArea, 
                                new_price: float) -> Dict:
        """Calculate potential revenue impact of price change"""
        try:
            # Get historical order data
            orders = OrderItem.objects.filter(
                service=service,
                order__customer__area=area.name
            ).count()
            
            current_price = self._get_current_price(service, area)
            price_change = (new_price - current_price) / current_price if current_price > 0 else 0
            
            # Estimate demand elasticity (simplified)
            elasticity = -0.5  # Assume -0.5 price elasticity
            demand_change = elasticity * price_change
            
            new_orders = max(0, orders * (1 + demand_change))
            revenue_change = (new_orders * new_price) - (orders * current_price)
            
            return {
                'current_orders': orders,
                'projected_orders': new_orders,
                'revenue_change': revenue_change,
                'price_change_percent': price_change * 100
            }
            
        except Exception as e:
            logger.error(f"Error calculating revenue impact: {str(e)}")
            return {'revenue_change': 0}
    
    def _generate_recommendations(self, optimized_prices: Dict) -> List[str]:
        """Generate pricing recommendations"""
        recommendations = []
        
        for area_name, data in optimized_prices.items():
            price_change = data['potential_revenue']['price_change_percent']
            
            if price_change > 10:
                recommendations.append(
                    f"Consider increasing {area_name} prices by {price_change:.1f}% - "
                    f"high revenue potential"
                )
            elif price_change < -10:
                recommendations.append(
                    f"Consider decreasing {area_name} prices by {abs(price_change):.1f}% - "
                    f"may increase demand"
                )
        
        return recommendations
