import React from 'react';
import { useSecurity } from '../context/SecurityContext';
import { ShieldAlert, Zap, AlertTriangle, RefreshCw } from 'lucide-react';

export const TopNav: React.FC = () => {
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
        <nav className="hidden md:flex items-center gap-5 text-sm font-medium text-slate-400">
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
            リモートメンテナンス
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

        {/* Zone 3: 1-2 primary actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Incident Simulator Button */}
          <button
            onClick={() => simulateLockoutIncident(selectedSite.id)}
            title="管理画面ロックと不正アクセス障害を再現し、暗号化ルートからの復旧フローをテストします"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-300 bg-amber-950/40 border border-amber-800/60 rounded-lg hover:bg-amber-900/50 transition-colors whitespace-nowrap cursor-pointer"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">ロック障害を再現</span>
            <span className="xs:hidden">障害再現</span>
          </button>

          {/* Quick Emergency Route Action */}
          {!isRouteConnected ? (
            <button
              onClick={() => connectEmergencyRoute(selectedSite.id)}
              disabled={isConnectingEmergencyRoute}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                isLocked 
                  ? 'bg-rose-600 hover:bg-rose-500 shadow-sm shadow-rose-900/40 animate-pulse' 
                  : 'bg-cyan-600 hover:bg-cyan-500 shadow-sm shadow-cyan-900/40'
              }`}
            >
              {isConnectingEmergencyRoute ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>確立中...</span>
                </>
              ) : (
                <>
                  <Zap className="w-3.5 h-3.5" />
                  <span>暗号ルート接続</span>
                </>
              )}
            </button>
          ) : (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-mono text-emerald-300 bg-emerald-950/40 border border-emerald-800/60 rounded-lg whitespace-nowrap">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>暗号化ルート接続中</span>
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
