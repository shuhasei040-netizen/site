import React from 'react';
import { useSecurity } from '../context/SecurityContext';
import { ShieldAlert, Zap, AlertTriangle, RefreshCw, Smartphone, Sun, Lock } from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';

interface TopNavProps {
  onOpenInstagram: () => void;
  onOpenDeviceLock: () => void;
  isWakeLockActive: boolean;
}

export const TopNav: React.FC<TopNavProps> = ({
  onOpenInstagram,
  onOpenDeviceLock,
  isWakeLockActive,
}) => {
  const { 
    activeTab, 
    setActiveTab, 
    selectedSite, 
    connectEmergencyRoute,
    isConnectingEmergencyRoute, 
    simulateLockoutIncident 
  } = useSecurity();

  const isLocked = selectedSite.status === 'critical_locked';
  const isRouteConnected = selectedSite.emergencyRouteStatus === 'connected';

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Zone 1: Single text element wordmark */}
        <a 
          href="/" 
          onClick={(e) => { e.preventDefault(); setActiveTab('recovery'); }}
          className="flex items-center gap-2 text-lg font-semibold tracking-tight text-white hover:text-cyan-300 transition-colors"
        >
          <span className="font-mono text-cyan-400">AEGIS</span>ROUTE SENTINEL
        </a>

        {/* Zone 2: Navigation Links for Desktop & Laptop */}
        <nav className="hidden lg:flex items-center gap-4 text-sm font-medium text-slate-400">
          <button
            onClick={() => setActiveTab('recovery')}
            className={`transition-colors hover:text-white whitespace-nowrap cursor-pointer py-1 ${
              activeTab === 'recovery' ? 'text-cyan-400 font-semibold border-b-2 border-cyan-400' : ''
            }`}
          >
            リカバリー制御
          </button>
          <button
            onClick={() => setActiveTab('site_setup')}
            className={`transition-colors hover:text-white whitespace-nowrap cursor-pointer py-1 ${
              activeTab === 'site_setup' ? 'text-cyan-400 font-semibold border-b-2 border-cyan-400' : ''
            }`}
          >
            実サイト導入・接続
          </button>
          <button
            onClick={() => setActiveTab('emergency_route')}
            className={`transition-colors hover:text-white whitespace-nowrap cursor-pointer py-1 ${
              activeTab === 'emergency_route' ? 'text-cyan-400 font-semibold border-b-2 border-cyan-400' : ''
            }`}
          >
            検証暗号化ルート
          </button>
          <button
            onClick={() => setActiveTab('vulnerabilities')}
            className={`transition-colors hover:text-white whitespace-nowrap cursor-pointer py-1 ${
              activeTab === 'vulnerabilities' ? 'text-cyan-400 font-semibold border-b-2 border-cyan-400' : ''
            }`}
          >
            バックドア検知
          </button>
          <button
            onClick={() => setActiveTab('agent_deploy')}
            className={`transition-colors hover:text-white whitespace-nowrap cursor-pointer py-1 ${
              activeTab === 'agent_deploy' ? 'text-cyan-400 font-semibold border-b-2 border-cyan-400' : ''
            }`}
          >
            エージェント構成
          </button>
          <button
            onClick={() => setActiveTab('maintenance')}
            className={`transition-colors hover:text-white whitespace-nowrap cursor-pointer py-1 ${
              activeTab === 'maintenance' ? 'text-cyan-400 font-semibold border-b-2 border-cyan-400' : ''
            }`}
          >
            リモートメンテ
          </button>
          <button
            onClick={() => setActiveTab('audit_logs')}
            className={`transition-colors hover:text-white whitespace-nowrap cursor-pointer py-1 ${
              activeTab === 'audit_logs' ? 'text-cyan-400 font-semibold border-b-2 border-cyan-400' : ''
            }`}
          >
            監査ログ
          </button>
        </nav>

        {/* Zone 3: Actions + Instagram + Device Lock + PWA */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Instagram Quick Launcher */}
          <button
            onClick={onOpenInstagram}
            title="サイトからInstagramへアクセス・アカウント連携"
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-amber-600 via-rose-600 to-purple-600 hover:opacity-90 rounded-lg shadow-sm shadow-pink-900/40 transition-all cursor-pointer whitespace-nowrap"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
            </svg>
            <span className="hidden sm:inline">Instagram</span>
          </button>

          {/* Device & Screen Lock Control */}
          <button
            onClick={onOpenDeviceLock}
            title="デバイス画面ロック防止・PWA常時点灯＆アプリPINロック制御"
            className={`inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-all cursor-pointer whitespace-nowrap ${
              isWakeLockActive 
                ? 'bg-amber-950/50 text-amber-300 border-amber-700/60 shadow-sm shadow-amber-900/30' 
                : 'bg-slate-900/80 text-slate-300 border-slate-700 hover:border-slate-500'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">端末ロック制御</span>
            {isWakeLockActive && (
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" title="画面ロック防止中" />
            )}
          </button>

          {/* PWA Install Button */}
          <PWAInstallButton />

          {/* Quick Emergency Route Action */}
          {!isRouteConnected ? (
            <button
              onClick={() => connectEmergencyRoute(selectedSite.id)}
              disabled={isConnectingEmergencyRoute}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                isLocked 
                  ? 'bg-rose-600 hover:bg-rose-500 shadow-sm shadow-rose-900/40 animate-pulse' 
                  : 'bg-cyan-600 hover:bg-cyan-500 shadow-sm shadow-cyan-900/40'
              }`}
            >
              {isConnectingEmergencyRoute ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span className="hidden sm:inline">確立中...</span>
                </>
              ) : (
                <>
                  <Zap className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">暗号ルート</span>
                </>
              )}
            </button>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-mono text-emerald-300 bg-emerald-950/40 border border-emerald-800/60 rounded-lg whitespace-nowrap">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="hidden sm:inline">暗号ルート接続中</span>
            </div>
          )}
        </div>
      </div>

      {/* Sub-bar for mobile/tablet screen sizes */}
      <div className="md:hidden border-t border-slate-800/80 bg-slate-950/95 px-4 py-2 overflow-x-auto flex items-center gap-4 text-xs font-medium text-slate-400 no-scrollbar">
        <button
          onClick={() => setActiveTab('recovery')}
          className={`whitespace-nowrap px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
            activeTab === 'recovery' ? 'bg-cyan-950 text-cyan-300 font-bold border border-cyan-700/60' : 'hover:text-white'
          }`}
        >
          リカバリー制御
        </button>
        <button
          onClick={() => setActiveTab('site_setup')}
          className={`whitespace-nowrap px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
            activeTab === 'site_setup' ? 'bg-cyan-950 text-cyan-300 font-bold border border-cyan-700/60' : 'hover:text-white'
          }`}
        >
          実サイト導入
        </button>
        <button
          onClick={() => setActiveTab('emergency_route')}
          className={`whitespace-nowrap px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
            activeTab === 'emergency_route' ? 'bg-cyan-950 text-cyan-300 font-bold border border-cyan-700/60' : 'hover:text-white'
          }`}
        >
          暗号化ルート
        </button>
        <button
          onClick={() => setActiveTab('vulnerabilities')}
          className={`whitespace-nowrap px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
            activeTab === 'vulnerabilities' ? 'bg-cyan-950 text-cyan-300 font-bold border border-cyan-700/60' : 'hover:text-white'
          }`}
        >
          バックドア検知
        </button>
        <button
          onClick={() => setActiveTab('agent_deploy')}
          className={`whitespace-nowrap px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
            activeTab === 'agent_deploy' ? 'bg-cyan-950 text-cyan-300 font-bold border border-cyan-700/60' : 'hover:text-white'
          }`}
        >
          エージェント
        </button>
        <button
          onClick={() => setActiveTab('maintenance')}
          className={`whitespace-nowrap px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
            activeTab === 'maintenance' ? 'bg-cyan-950 text-cyan-300 font-bold border border-cyan-700/60' : 'hover:text-white'
          }`}
        >
          メンテナンス
        </button>
        <button
          onClick={() => setActiveTab('audit_logs')}
          className={`whitespace-nowrap px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
            activeTab === 'audit_logs' ? 'bg-cyan-950 text-cyan-300 font-bold border border-cyan-700/60' : 'hover:text-white'
          }`}
        >
          監査ログ
        </button>
      </div>
    </header>
  );
};
