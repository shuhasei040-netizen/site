import React from 'react';
import { SecurityProvider, useSecurity } from './context/SecurityContext';
import { TopNav } from './components/TopNav';
import { SiteHeaderBar } from './components/SiteHeaderBar';
import { IncidentRecoveryView } from './components/IncidentRecoveryView';
import { EmergencyRouteView } from './components/EmergencyRouteView';
import { VulnerabilityScannerView } from './components/VulnerabilityScannerView';
import { AgentDeployView } from './components/AgentDeployView';
import { RemoteMaintenanceView } from './components/RemoteMaintenanceView';
import { AuditLogView } from './components/AuditLogView';
import { SiteSetupView } from './components/SiteSetupView';
import { ShieldCheck, Lock, Radio, Terminal, FileCode, Clock } from 'lucide-react';

const MainContent: React.FC = () => {
  const { activeTab, setActiveTab } = useSecurity();

  React.useEffect(() => {
    const handler = () => setActiveTab('audit_logs');
    window.addEventListener('open_audit_tab', handler);
    return () => window.removeEventListener('open_audit_tab', handler);
  }, [setActiveTab]);

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {activeTab === 'recovery' && <IncidentRecoveryView />}
      {activeTab === 'site_setup' && <SiteSetupView />}
      {activeTab === 'emergency_route' && <EmergencyRouteView />}
      {activeTab === 'vulnerabilities' && <VulnerabilityScannerView />}
      {activeTab === 'agent_deploy' && <AgentDeployView />}
      {activeTab === 'maintenance' && <RemoteMaintenanceView />}
      {activeTab === 'audit_logs' && <AuditLogView />}
    </main>
  );
};

export default function App() {
  return (
    <SecurityProvider>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
        {/* Top Navigation conforming to Top Bar Contract */}
        <TopNav />

        {/* Target Site Selector & Unboxed Metadata Header */}
        <SiteHeaderBar />

        {/* Main Work Area */}
        <div className="flex-1">
          <MainContent />
        </div>

        {/* Clean, Non-ornamental Footer */}
        <footer className="border-t border-slate-900 bg-slate-950/80 py-6 text-xs text-slate-500">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-400">AegisRoute Sentinel</span>
              <span>·</span>
              <span>緊急暗号化ルート接続＆高セキュリティ・リモートメンテナンス管理基盤</span>
            </div>
            <div className="flex items-center gap-4 text-slate-400">
              <button 
                onClick={() => {
                  const evt = new CustomEvent('open_audit_tab');
                  window.dispatchEvent(evt);
                }}
                className="hover:text-cyan-300 transition-colors cursor-pointer"
              >
                暗号化監査証跡 (Audit Logs)
              </button>
              <span>·</span>
              <span>Mutual TLS 1.3 / Ed25519</span>
              <span>·</span>
              <span>ゼロトラスト運用準拠</span>
            </div>
          </div>
        </footer>
      </div>
    </SecurityProvider>
  );
}
