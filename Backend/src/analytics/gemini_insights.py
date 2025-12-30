"""
Gemini AI-Powered Analytics Insights
Uses Vertex AI Gemini to generate intelligent insights from compliance data
"""

import os
import json
import logging
from typing import Dict, List, Any, Optional
import google.generativeai as genai
from datetime import datetime

logger = logging.getLogger(__name__)


class GeminiInsights:
    """Generate AI-powered insights using Gemini"""
    
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY")
        
        if self.api_key:
            genai.configure(api_key=self.api_key)
            self.model = genai.GenerativeModel('gemini-3-pro-preview')
            logger.info("[Gemini] Initialized for analytics insights")
        else:
            self.model = None
            logger.warning("[Gemini] API key not found")
    
    def generate_executive_summary(self, analytics_data: Dict[str, Any]) -> str:
        """Generate executive summary from analytics data"""
        if not self.model:
            return self._fallback_summary(analytics_data)
        
        try:
            prompt = f"""
You are a compliance analytics expert. Generate a concise executive summary (3-4 sentences) 
based on this compliance data:

Total Documents: {analytics_data.get('total_documents', 0)}
Average Compliance Score: {analytics_data.get('average_compliance_score', 0)}%
High Risk Documents: {analytics_data.get('high_risk_documents', 0)}
Total Violations: {analytics_data.get('total_violations', 0)}

Focus on:
1. Overall compliance health
2. Key risk areas
3. Actionable recommendations

Be professional and concise.
"""
            
            response = self.model.generate_content(prompt)
            return response.text.strip()
        
        except Exception as e:
            logger.error(f"[Gemini] Error generating summary: {e}")
            return self._fallback_summary(analytics_data)
    
    def analyze_trends(self, trend_data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze compliance trends and provide insights"""
        if not self.model or not trend_data:
            return self._fallback_trend_analysis(trend_data)
        
        try:
            # Prepare trend summary
            recent_scores = [d['compliance_score'] for d in trend_data[-7:]]
            avg_recent = sum(recent_scores) / len(recent_scores)
            
            prompt = f"""
Analyze these compliance trends over the last {len(trend_data)} days:

Recent 7-day average compliance score: {avg_recent:.1f}%
Highest score: {max(d['compliance_score'] for d in trend_data)}%
Lowest score: {min(d['compliance_score'] for d in trend_data)}%

Data points (last 7 days):
{json.dumps(trend_data[-7:], indent=2)}

Provide:
1. Trend direction (improving/stable/declining)
2. Key observation (1 sentence)
3. Prediction for next 7 days
4. One actionable recommendation

Return as JSON with keys: direction, observation, prediction, recommendation
"""
            
            response = self.model.generate_content(prompt)
            result = self._parse_json_response(response.text)
            
            return {
                "direction": result.get("direction", "stable"),
                "observation": result.get("observation", "Compliance levels are within normal range"),
                "prediction": result.get("prediction", "Expected to remain stable"),
                "recommendation": result.get("recommendation", "Continue monitoring key violations"),
                "confidence": 0.85
            }
        
        except Exception as e:
            logger.error(f"[Gemini] Error analyzing trends: {e}")
            return self._fallback_trend_analysis(trend_data)
    
    def identify_patterns(self, violations: List[Dict[str, Any]]) -> List[str]:
        """Identify patterns in compliance violations"""
        if not self.model or not violations:
            return ["Focus on most common violations", "Review high-severity issues first"]
        
        try:
            violations_summary = "\n".join([
                f"- {v['regulation']}: {v['count']} occurrences ({v['severity']} severity)"
                for v in violations[:5]
            ])
            
            prompt = f"""
Analyze these compliance violations and identify 3-4 key patterns or insights:

{violations_summary}

Provide insights as a JSON array of strings. Each insight should be:
- Actionable
- Specific to the data
- Professional tone

Example: ["LODR Reg 43 violations indicate systematic timeline issues", ...]
"""
            
            response = self.model.generate_content(prompt)
            patterns = self._parse_json_response(response.text)
            
            if isinstance(patterns, list):
                return patterns[:4]
            else:
                return ["Review timeline-related regulations", "Focus on disclosure requirements"]
        
        except Exception as e:
            logger.error(f"[Gemini] Error identifying patterns: {e}")
            return ["Review most frequent violations", "Focus on high-severity issues"]
    
    def generate_recommendations(self, analytics_data: Dict[str, Any]) -> List[Dict[str, str]]:
        """Generate actionable recommendations"""
        if not self.model:
            return self._fallback_recommendations()
        
        try:
            prompt = f"""
Based on this compliance data, generate 5 specific, actionable recommendations:

Average Compliance Score: {analytics_data.get('average_compliance_score', 0)}%
High Risk Documents: {analytics_data.get('high_risk_documents', 0)}
Compliance Trend: {analytics_data.get('compliance_trend', 'stable')}

Each recommendation should have:
- title: Short action title
- description: Brief explanation (1 sentence)
- priority: high/medium/low
- impact: Expected improvement

Return as JSON array of objects.
"""
            
            response = self.model.generate_content(prompt)
            recommendations = self._parse_json_response(response.text)
            
            if isinstance(recommendations, list):
                return recommendations[:5]
            else:
                return self._fallback_recommendations()
        
        except Exception as e:
            logger.error(f"[Gemini] Error generating recommendations: {e}")
            return self._fallback_recommendations()
    
    def predict_compliance_score(self, historical_data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Predict future compliance scores"""
        if not self.model or not historical_data:
            return {"predicted_score": 87.0, "confidence": 0.70, "trend": "stable"}
        
        try:
            recent_scores = [d['compliance_score'] for d in historical_data[-14:]]
            
            prompt = f"""
Based on these compliance scores from the last 14 days, predict the next 7 days:

Scores: {recent_scores}

Provide:
1. predicted_score: Average score for next 7 days (number)
2. confidence: Confidence level 0-1 (number)
3. trend: improving/stable/declining (string)
4. rationale: Brief explanation (string)

Return as JSON object.
"""
            
            response = self.model.generate_content(prompt)
            prediction = self._parse_json_response(response.text)
            
            return {
                "predicted_score": float(prediction.get("predicted_score", 87.0)),
                "confidence": float(prediction.get("confidence", 0.75)),
                "trend": prediction.get("trend", "stable"),
                "rationale": prediction.get("rationale", "Based on historical trends")
            }
        
        except Exception as e:
            logger.error(f"[Gemini] Error predicting score: {e}")
            return {"predicted_score": 87.0, "confidence": 0.70, "trend": "stable"}
    
    def _parse_json_response(self, response: str) -> Any:
        """Parse JSON from Gemini response"""
        try:
            # Try to extract JSON from markdown code blocks
            if "```json" in response:
                json_str = response.split("```json")[1].split("```")[0].strip()
            elif "```" in response:
                json_str = response.split("```")[1].split("```")[0].strip()
            else:
                json_str = response.strip()
            
            return json.loads(json_str)
        except Exception as e:
            logger.warning(f"[Gemini] Could not parse JSON: {e}")
            return {}
    
    def _fallback_summary(self, data: Dict[str, Any]) -> str:
        """Fallback summary when Gemini is unavailable"""
        avg_score = data.get('average_compliance_score', 0)
        high_risk = data.get('high_risk_documents', 0)
        
        return f"""Overall compliance health is {"strong" if avg_score > 85 else "moderate" if avg_score > 70 else "needs improvement"} 
with an average score of {avg_score}%. {high_risk} documents require immediate attention. 
Focus on addressing high-severity violations and improving documentation processes."""
    
    def _fallback_trend_analysis(self, trend_data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Fallback trend analysis"""
        if not trend_data:
            return {
                "direction": "stable",
                "observation": "Insufficient data for trend analysis",
                "prediction": "Continue monitoring",
                "recommendation": "Upload more documents for better insights",
                "confidence": 0.5
            }
        
        recent = [d['compliance_score'] for d in trend_data[-7:]]
        avg = sum(recent) / len(recent)
        
        return {
            "direction": "stable",
            "observation": f"Average compliance score is {avg:.1f}%",
            "prediction": "Expected to remain stable",
            "recommendation": "Continue current compliance practices",
            "confidence": 0.75
        }
    
    def _fallback_recommendations(self) -> List[Dict[str, str]]:
        """Fallback recommendations"""
        return [
            {
                "title": "Review High-Risk Documents",
                "description": "Prioritize analysis of documents flagged as high risk",
                "priority": "high",
                "impact": "Reduce compliance violations by 30%"
            },
            {
                "title": "Update Document Templates",
                "description": "Ensure templates comply with latest SEBI regulations",
                "priority": "medium",
                "impact": "Improve baseline compliance score"
            },
            {
                "title": "Conduct Training Sessions",
                "description": "Train team on common compliance issues",
                "priority": "medium",
                "impact": "Reduce recurring violations"
            }
        ]


# Singleton instance
_gemini_insights = None

def get_gemini_insights() -> GeminiInsights:
    """Get or create Gemini insights instance"""
    global _gemini_insights
    if _gemini_insights is None:
        _gemini_insights = GeminiInsights()
    return _gemini_insights

