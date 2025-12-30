"""
Analytics API Endpoints
Real-time analytics powered by BigQuery and Gemini AI
"""

from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from typing import Dict, Any, Optional
import logging

from .bigquery_analytics import get_analytics_service
from .gemini_insights import get_gemini_insights

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/analytics", tags=["analytics"])


@router.get("/overview")
async def get_analytics_overview() -> Dict[str, Any]:
    """
    Get comprehensive analytics overview
    Combines BigQuery data with Gemini AI insights
    """
    try:
        analytics = get_analytics_service()
        gemini = get_gemini_insights()
        
        # Get raw data
        overview = analytics.get_compliance_overview()
        risk_dist = analytics.get_risk_distribution()
        violations = analytics.get_top_violations(5)
        
        # Generate AI insights
        executive_summary = gemini.generate_executive_summary(overview)
        patterns = gemini.identify_patterns(violations)
        
        return {
            "overview": overview,
            "risk_distribution": risk_dist,
            "top_violations": violations,
            "ai_insights": {
                "executive_summary": executive_summary,
                "key_patterns": patterns
            },
            "status": "success"
        }
    
    except Exception as e:
        logger.error(f"[Analytics API] Error in overview: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/trends")
async def get_compliance_trends(days: int = 30) -> Dict[str, Any]:
    """
    Get compliance trends over time with AI analysis
    """
    try:
        analytics = get_analytics_service()
        gemini = get_gemini_insights()
        
        # Get trend data
        trends = analytics.get_compliance_trends(days)
        
        # AI trend analysis
        trend_analysis = gemini.analyze_trends(trends)
        
        # Prediction
        prediction = gemini.predict_compliance_score(trends)
        
        return {
            "trends": trends,
            "analysis": trend_analysis,
            "prediction": prediction,
            "period_days": days,
            "status": "success"
        }
    
    except Exception as e:
        logger.error(f"[Analytics API] Error in trends: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/recommendations")
async def get_ai_recommendations() -> Dict[str, Any]:
    """
    Get AI-powered recommendations for improving compliance
    """
    try:
        analytics = get_analytics_service()
        gemini = get_gemini_insights()
        
        # Get current state
        overview = analytics.get_compliance_overview()
        advanced_insights = analytics.get_advanced_insights()
        
        # Generate recommendations
        recommendations = gemini.generate_recommendations(overview)
        
        return {
            "recommendations": recommendations,
            "anomalies": advanced_insights.get("anomalies_detected", []),
            "predictive_analysis": advanced_insights.get("predictive_analysis", {}),
            "status": "success"
        }
    
    except Exception as e:
        logger.error(f"[Analytics API] Error in recommendations: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/violations")
async def get_violation_analysis(limit: int = 10) -> Dict[str, Any]:
    """
    Get detailed violation analysis with patterns
    """
    try:
        analytics = get_analytics_service()
        gemini = get_gemini_insights()
        
        # Get violations
        violations = analytics.get_top_violations(limit)
        
        # Identify patterns
        patterns = gemini.identify_patterns(violations)
        
        return {
            "violations": violations,
            "patterns": patterns,
            "total_types": len(violations),
            "status": "success"
        }
    
    except Exception as e:
        logger.error(f"[Analytics API] Error in violations: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/regulation-coverage")
async def get_regulation_coverage() -> Dict[str, Any]:
    """
    Get SEBI regulation coverage analysis
    """
    try:
        analytics = get_analytics_service()
        
        coverage = analytics.get_regulation_coverage()
        
        return {
            "coverage": coverage,
            "total_categories": len(coverage),
            "status": "success"
        }
    
    except Exception as e:
        logger.error(f"[Analytics API] Error in regulation coverage: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/document-history")
async def get_document_history(limit: int = 50) -> Dict[str, Any]:
    """
    Get recent document analysis history
    """
    try:
        analytics = get_analytics_service()
        
        history = analytics.get_document_analysis_history(limit)
        
        return {
            "history": history,
            "total": len(history),
            "status": "success"
        }
    
    except Exception as e:
        logger.error(f"[Analytics API] Error in document history: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/advanced-insights")
async def get_advanced_insights() -> Dict[str, Any]:
    """
    Get advanced AI-powered insights
    - Anomaly detection
    - Predictive analytics
    - Smart recommendations
    """
    try:
        analytics = get_analytics_service()
        gemini = get_gemini_insights()
        
        # Get advanced insights
        insights = analytics.get_advanced_insights()
        
        # Get trend data for prediction
        trends = analytics.get_compliance_trends(30)
        prediction = gemini.predict_compliance_score(trends)
        
        # Combine insights
        return {
            "anomalies": insights.get("anomalies_detected", []),
            "prediction": prediction,
            "recommendations": insights.get("recommendations", []),
            "confidence_score": prediction.get("confidence", 0.75),
            "status": "success"
        }
    
    except Exception as e:
        logger.error(f"[Analytics API] Error in advanced insights: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/health")
async def analytics_health() -> Dict[str, str]:
    """Health check for analytics service"""
    analytics = get_analytics_service()
    gemini = get_gemini_insights()
    
    return {
        "status": "healthy",
        "bigquery": "connected" if analytics.bq_client else "not_configured",
        "gemini": "active" if gemini.model else "not_configured"
    }

