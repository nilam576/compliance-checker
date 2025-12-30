"""
Kibana Visualization Creator
Programmatically create Kibana dashboards for compliance analytics
"""

import json
from typing import Dict, List, Any


class VisualizationCreator:
    """
    Creates Kibana dashboard configurations for compliance data visualization.
    """
    
    @staticmethod
    def create_compliance_dashboard() -> Dict[str, Any]:
        """
        Create main compliance dashboard configuration.
        """
        return {
            "title": "RegLex AI - Compliance Overview",
            "description": "Real-time compliance monitoring and analytics",
            "panels": [
                VisualizationCreator._create_metric_panel(
                    title="Total Documents",
                    field="doc_id.keyword",
                    position={"x": 0, "y": 0, "w": 12, "h": 8}
                ),
                VisualizationCreator._create_metric_panel(
                    title="Compliance Score",
                    field="compliance_score",
                    agg_type="avg",
                    position={"x": 12, "y": 0, "w": 12, "h": 8}
                ),
                VisualizationCreator._create_pie_chart(
                    title="Risk Distribution",
                    field="risk_level.keyword",
                    position={"x": 0, "y": 8, "w": 24, "h": 16}
                ),
                VisualizationCreator._create_line_chart(
                    title="Compliance Trends",
                    x_field="@timestamp",
                    y_field="compliance_score",
                    position={"x": 0, "y": 24, "w": 48, "h": 16}
                ),
                VisualizationCreator._create_bar_chart(
                    title="Common Violations",
                    field="violated_regulations.keyword",
                    position={"x": 0, "y": 40, "w": 48, "h": 16}
                )
            ]
        }
    
    @staticmethod
    def _create_metric_panel(
        title: str,
        field: str,
        agg_type: str = "cardinality",
        position: Dict[str, int] = None
    ) -> Dict[str, Any]:
        """Create a metric visualization panel."""
        return {
            "type": "visualization",
            "title": title,
            "visualization": {
                "type": "metric",
                "params": {
                    "metric": {
                        "colorSchema": "Green to Red",
                        "colorsRange": [
                            {"from": 0, "to": 50},
                            {"from": 50, "to": 75},
                            {"from": 75, "to": 100}
                        ],
                        "labels": {"show": True},
                        "style": {
                            "bgColor": False,
                            "fontSize": 60,
                            "labelColor": False
                        }
                    },
                    "addTooltip": True,
                    "addLegend": False,
                    "type": "metric"
                },
                "aggs": [
                    {
                        "id": "1",
                        "type": agg_type,
                        "schema": "metric",
                        "params": {"field": field}
                    }
                ]
            },
            "position": position or {"x": 0, "y": 0, "w": 12, "h": 8}
        }
    
    @staticmethod
    def _create_pie_chart(
        title: str,
        field: str,
        position: Dict[str, int] = None
    ) -> Dict[str, Any]:
        """Create a pie chart visualization."""
        return {
            "type": "visualization",
            "title": title,
            "visualization": {
                "type": "pie",
                "params": {
                    "addTooltip": True,
                    "addLegend": True,
                    "legendPosition": "right",
                    "isDonut": True,
                    "labels": {
                        "show": True,
                        "values": True,
                        "last_level": True,
                        "truncate": 100
                    }
                },
                "aggs": [
                    {
                        "id": "1",
                        "type": "count",
                        "schema": "metric"
                    },
                    {
                        "id": "2",
                        "type": "terms",
                        "schema": "segment",
                        "params": {
                            "field": field,
                            "size": 10,
                            "order": "desc",
                            "orderBy": "1"
                        }
                    }
                ]
            },
            "position": position or {"x": 0, "y": 0, "w": 24, "h": 16}
        }
    
    @staticmethod
    def _create_line_chart(
        title: str,
        x_field: str,
        y_field: str,
        position: Dict[str, int] = None
    ) -> Dict[str, Any]:
        """Create a line chart visualization."""
        return {
            "type": "visualization",
            "title": title,
            "visualization": {
                "type": "line",
                "params": {
                    "addTooltip": True,
                    "addLegend": True,
                    "legendPosition": "right",
                    "showCircles": True,
                    "interpolate": "linear",
                    "scale": "linear",
                    "drawLinesBetweenPoints": True,
                    "radiusRatio": 9,
                    "times": [],
                    "addTimeMarker": False,
                    "grid": {
                        "categoryLines": False,
                        "valueAxis": "ValueAxis-1"
                    }
                },
                "aggs": [
                    {
                        "id": "1",
                        "type": "avg",
                        "schema": "metric",
                        "params": {"field": y_field}
                    },
                    {
                        "id": "2",
                        "type": "date_histogram",
                        "schema": "segment",
                        "params": {
                            "field": x_field,
                            "interval": "auto",
                            "customInterval": "2h",
                            "min_doc_count": 1,
                            "extended_bounds": {}
                        }
                    }
                ]
            },
            "position": position or {"x": 0, "y": 0, "w": 48, "h": 16}
        }
    
    @staticmethod
    def _create_bar_chart(
        title: str,
        field: str,
        position: Dict[str, int] = None
    ) -> Dict[str, Any]:
        """Create a bar chart visualization."""
        return {
            "type": "visualization",
            "title": title,
            "visualization": {
                "type": "histogram",
                "params": {
                    "addTooltip": True,
                    "addLegend": True,
                    "legendPosition": "right",
                    "scale": "linear",
                    "mode": "stacked",
                    "times": [],
                    "addTimeMarker": False,
                    "grid": {
                        "categoryLines": False,
                        "valueAxis": "ValueAxis-1"
                    }
                },
                "aggs": [
                    {
                        "id": "1",
                        "type": "count",
                        "schema": "metric"
                    },
                    {
                        "id": "2",
                        "type": "terms",
                        "schema": "segment",
                        "params": {
                            "field": field,
                            "size": 10,
                            "order": "desc",
                            "orderBy": "1"
                        }
                    }
                ]
            },
            "position": position or {"x": 0, "y": 0, "w": 48, "h": 16}
        }
    
    @staticmethod
    def export_dashboards() -> str:
        """Export dashboard configurations as JSON."""
        dashboards = {
            "compliance_overview": VisualizationCreator.create_compliance_dashboard()
        }
        return json.dumps(dashboards, indent=2)

