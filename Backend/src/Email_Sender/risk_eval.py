def is_high_risk(clause):
    return clause["risk_score"] > 80 and clause["deadline_days"] <= 2