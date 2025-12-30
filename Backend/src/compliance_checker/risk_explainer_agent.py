"""
Risk Explanation Agent

This agent converts compliance verification results into
business-oriented risk assessments with severity, category,
impact, and suggested mitigation.
"""

# Keywords Corpus for Risk Assessment
RISK_KEYWORDS = {
    "Legal": {
        "low": {
            "keywords": [
                "data retention", "email consent", "basic disclosure", "cookie banner",
                "age verification", "opt-in form", "advertising guidelines", "copyright notice",
                "privacy notice", "employee conduct", "whistleblower", "training requirement",
                "website policy", "privacy shield", "standard contractual clause",
                "basic nda", "intellectual property marking", "brand usage",
                "simple contract clause", "minor compliance update"
            ],
            "score": 3
        },
        "medium": {
            "keywords": [
                "HIPAA", "SOX", "PCI DSS", "consumer protection", "cross-border data transfer",
                "sensitive personal data", "data subject rights", "informed consent",
                "retention limits", "audit obligation", "non-compete", "breach of contract",
                "export control", "AML (anti money laundering)", "licensing terms",
                "GDPR DPIA", "standard of care", "industry compliance", "governance policy",
                "harassment law"
            ],
            "score": 6
        },
        "high": {
            "keywords": [
                "GDPR", "CCPA", "antitrust", "competition law", "bribery", "corruption",
                "criminal liability", "environmental violation", "trade secrets theft",
                "fraud", "FCPA", "money laundering", "sanctions violation", "terrorism financing",
                "child protection law", "discrimination", "illegal surveillance",
                "human rights violation", "genocide", "war crimes", "insider trading"
            ],
            "score": 9
        }
    },
    "Financial": {
        "low": {
            "keywords": [
                "late payment", "small fines", "bank reconciliation", "reporting error",
                "clerical error", "budget overrun", "low-value transaction",
                "delayed invoice", "currency rounding", "operational fee",
                " petty cash", "minor audit finding", "tax filing delay",
                "mislabelled expense", "duplicate entry", "simple variance",
                "low materiality", "accounting correction", "vendor misreport",
                "invoice mismatch", "expense approval"
            ],
            "score": 2
        },
        "medium": {
            "keywords": [
                "tax evasion suspicion", "AML alert", "financial reporting",
                "capital adequacy", "unsecured loan", "medium-value fraud",
                "internal audit fail", "SOX non-compliance", "credit rating impact",
                "hedging loss", "currency risk", "insurance lapse", "payment system breach",
                "misrepresentation", "loan covenant breach", "fraudulent invoice",
                "deferred revenue issue", "derivatives misstatement", "suspicious transfer",
                "foreign exchange loss"
            ],
            "score": 6
        },
        "high": {
            "keywords": [
                "money laundering", "securities fraud", "embezzlement", "bankruptcy",
                "Ponzi scheme", "financial crime", "tax fraud", "insider trading",
                "terrorist financing", "capital market manipulation", "bribery fund",
                "illegal investment scheme", "sanctions breach", "shadow banking",
                "large-scale fraud", "regulatory fine", "stock manipulation",
                "false accounting", "loan sharking", "crypto scam", "bond default"
            ],
            "score": 10
        }
    },
    "Operational": {
        "low": {
            "keywords": [
                "delayed delivery", "staff absence", "machine downtime",
                "workplace safety note", "minor IT outage", "low-value procurement",
                "non-critical defect", "small process gap", "customer complaint",
                "service delay", "shift absence", "supply hiccup", "reporting lag",
                "maintenance miss", "lost document", "email misrouting",
                "meeting delay", "training lapse", "manual error", "low priority backlog"
            ],
            "score": 2
        },
        "medium": {
            "keywords": [
                "data breach", "service outage", "operational fraud",
                "cybersecurity gap", "vendor failure", "compliance gap",
                "medium downtime", "untrained staff", "supply chain risk",
                "system vulnerability", "policy violation", "unauthorized access",
                "payment delay", "fraud detection miss", "incomplete audit trail",
                "incorrect reporting", "KYC failure", "license lapse",
                "safety breach", "medium-scale disruption"
            ],
            "score": 5
        },
        "high": {
            "keywords": [
                "ransomware", "system hack", "major data breach",
                "identity theft", "critical infrastructure failure",
                "regulatory shutdown", "large-scale fraud",
                "supply chain collapse", "factory shutdown", "nation-state attack",
                "major service outage", "cyber espionage", "espionage",
                "unauthorized disclosure", "operational sabotage",
                "environmental spill", "toxic release", "industrial accident",
                "explosion", "mass casualty"
            ],
            "score": 9
        }
    }
}

class RiskExplainer:
    def __init__(self, llm_client="gemini"):
        """
        Initialize the RiskExplainer with a specific LLM client.
        """
        self.llm_client = llm_client

    def explain_risk(self, verifier_result: dict) -> dict:
        """
        Explain the risk associated with a given verification result.
        Args:
            verifier_result (dict): The verification result to analyze.
        Returns:
            dict: A dictionary containing the risk analysis.
        """
        if verifier_result["is_compliant"]:
            return {
                "severity": "None",
                "category": "None",
                "risk_score": 0,
                "impact": "No regulatory exposure.",
                "mitigation": "No action required."
            }

        matched_text = " ".join([r["rule"] for r in verifier_result["matched_rules"]])

        for category, levels in RISK_KEYWORDS.items():
            for severity, config in levels.items():
                if any(keyword.lower() in matched_text.lower() for keyword in config["keywords"]):
                    return {
                        "severity": severity.capitalize(),
                        "category": category,
                        "risk_score": config["score"],
                        "impact": f"{category} risk ({severity}) detected.",
                        "mitigation": "Review and address compliance gap immediately."
                    }
        return None

    def explain_all(self, verifier_results: list[dict]) -> list[dict]:
        """
        Takes a list of verifier results and appends risk analysis to each.
        Args:
            verifier_results: A list of verifier result dictionaries.
        Returns:
            A list of risk analysis dictionaries corresponding to each verifier result.
        """
        return [self.explain_risk(res) for res in verifier_results]
