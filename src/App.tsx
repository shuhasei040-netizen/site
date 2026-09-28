import React, { useState } from 'react';
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
import { InstagramView } from './components/InstagramView';
import { InstagramModal } from './components/InstagramModal';
import { DeviceLockModal } from './components/DeviceLockModal';
import { AppLockScreen } from './components/AppLockScreen';
import { useDeviceLock } from './hooks/useDeviceLock';
import { ShieldCheck, Lock, Radio, Terminal, FileCode, Clock } from 'lucide-react';

const MainContent: React.FC = () => {
  const { activeTab, setActiveTab } = useSecurity();

  React.useEffect(() => {
    const handler = () => setActiveTab('audit_logs');
    window.addEventListener('open_audit_tab', handler);
    return () => window.removeEventListener('open_audit_tab', handler);
  }, [setActiveTab]);

  React.useEffect(() => {
    const handler = () => setActiveTab('instagram');
    window.addEventListener('open_instagram_tab', handler);
    return () => window.removeEventListener('open_instagram_tab', handler);
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
      {activeTab === 'instagram' && <InstagramView />}
    </main>
  );
};

export default function App() {
  const [isInstagramOpen, setIsInstagramOpen] = useState(false);
  const [isDeviceLockOpen, setIsDeviceLockOpen] = useState(false);

  React.useEffect(() => {
    const handleOpenInsta = () => setIsInstagramOpen(true);
    window.addEventListener('open_instagram_modal', handleOpenInsta);
    return () => window.removeEventListener('open_instagram_modal', handleOpenInsta);
  }, []);

  const {
    config,
    updateConfig,
    wakeLockSupported,
    isWakeLockActive,
    toggleWakeLock,
    isAppLocked,
    lockAppNow,
    unlockApp,
  } = useDeviceLock();

  return (
    <SecurityProvider>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
        {/* Full App Security Lock Screen when triggered */}
        {isAppLocked && (
          <AppLockScreen 
            onUnlock={unlockApp} 
            onOpenInstagram={() => setIsInstagramOpen(true)} 
          />
        )}

        {/* Top Navigation conforming to Top Bar Contract with Instagram & Device Lock */}
        <TopNav 
          onOpenInstagram={() => setIsInstagramOpen(true)}
          onOpenDeviceLock={() => setIsDeviceLockOpen(true)}
          isWakeLockActive={isWakeLockActive}
        />

        {/* Target Site Selector & Unboxed Metadata Header */}
        <SiteHeaderBar />

        {/* Main Work Area */}
        <div className="flex-1">
          <MainContent />
        </div>

        {/* Instagram Access & Integration Modal */}
        <InstagramModal 
          isOpen={isInstagramOpen} 
          onClose={() => setIsInstagramOpen(false)} 
        />

        {/* Device Screen Lock & App Lock Settings Modal */}
        <DeviceLockModal
          isOpen={isDeviceLockOpen}
          onClose={() => setIsDeviceLockOpen(false)}
          config={config}
          updateConfig={updateConfig}
          isWakeLockActive={isWakeLockActive}
          wakeLockSupported={wakeLockSupported}
          toggleWakeLock={toggleWakeLock}
          lockAppNow={lockAppNow}
        />

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
                onClick={() => setIsInstagramOpen(true)}
                className="hover:text-pink-400 transition-colors cursor-pointer flex items-center gap-1"
              >
                <span>Instagram連携</span>
              </button>
              <span>·</span>
              <button
                onClick={() => setIsDeviceLockOpen(true)}
                className="hover:text-cyan-400 transition-colors cursor-pointer flex items-center gap-1"
              >
                <span>画面スリープ・端末ロック制御</span>
              </button>
              <span>·</span>
              <button 
                onClick={() => {
                  const evt = new CustomEvent('open_audit_tab');
                  window.dispatchEvent(evt);
                }}
                className="hover:text-cyan-300 transition-colors cursor-pointer"
              >
                暗号化監査証跡 (Audit Logs)
              </button>
            </div>
          </div>
        </footer>
      </div>
    </SecurityProvider>
  );
}

