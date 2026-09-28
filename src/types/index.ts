export type SiteStatus = 'nominal' | 'warning' | 'critical_locked' | 'recovering';

export interface TargetSite {
  id: string;
  name: string;
  url: string;
  adminPath: string;
  environment: 'production' | 'staging' | 'internal';
  status: SiteStatus;
  primaryAdminReachable: boolean;
  emergencyRouteStatus: 'connected' | 'standby' | 'disconnected' | 'connecting';
  emergencyRouteKeyFingerprint: string;
  emergencyRouteIp: string;
  lastHeartbeat: string;
  latencyMs: number;
  agentInstalled: boolean;
  agentVersion: string;
  activeThreatCount: number;
  cmsType: 'WordPress' | 'Laravel' | 'Custom Next.js' | 'Drupal' | 'EC-CUBE';
  secretToken: string;
  customEndpointPath: string;
  isLiveConnected: boolean;
  liveResponseData?: {
    phpVersion?: string;
    serverSoftware?: string;
    memoryUsage?: string;
    lastChecked?: string;
    statusMessage?: string;
    isWritable?: boolean;
  };
}

export interface SecurityVulnerability {
  id: string;
  siteId: string;
  type: 'backdoor' | 'unauthorized_admin' | 'tampered_config' | 'exposed_secret' | 'rogue_cron';
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  targetPath: string;
  description: string;
  detectedAt: string;
  evidence: string;
  isNeutralized: boolean;
  neutralizedAt?: string;
  recommendedAction: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  siteId: string;
  operator: string;
  channel: 'Emergency Encrypted Route' | 'Agent Secure Pipe' | 'Console Zero-Trust';
  action: string;
  status: 'success' | 'failed' | 'in_progress';
  details: string;
}

export interface AgentConfigOptions {
  siteUrl: string;
  environment: string;
  encryptionAlgorithm: 'Ed25519 + ChaCha20-Poly1305' | 'RSA-4096 + AES-256-GCM';
  heartbeatIntervalSec: number;
  allowedCidrs: string;
  isolationMode: 'hard_quarantine' | 'safe_mode_only';
  dropinLanguage: 'bash' | 'php' | 'python' | 'yaml';
}
