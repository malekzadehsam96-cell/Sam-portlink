export interface TelemetryEvent {
  id: string;
  timestamp: string;
  type: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  sourceIp: string;
  status: string;
}

export interface NetworkIntelligence {
  activeThreats: number;
  globalRiskScore: number;
  monitoredSessions: number;
  anomaliesDetected: number;
}

export interface RiskTrendData {
  time: string;
  riskScore: number;
  baseline: number;
}
