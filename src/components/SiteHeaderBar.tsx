import React, { useState } from 'react';
import { useSecurity } from '../context/SecurityContext';
import { TargetSite } from '../types';
import { Shield, ShieldAlert, CheckCircle2, AlertOctagon, Plus, ExternalLink, Key, Lock, Unlock } from 'lucide-react';
import { NewSiteModal } from './NewSiteModal';

export const SiteHeaderBar: React.FC = () => {
  const { sites, selectedSiteId, selectSite, selectedSite, setActiveTab } = useSecurity();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const getStatusDisplay = (site: TargetSite) => {
    switch (site.status) {
      case 'critical_locked':
        return {
          label: '管理画面ロック / 障害発生',
          className: 'text-rose-400 font-semibold',
          icon: ShieldAlert
        };
      case 'recovering':
        return {
          label: 'リカバリー処理中',
          className: 'text-amber-400 font-semibold',
          icon: AlertOctagon
        };
      case 'warning':
        return {
          label: '要注意 (不審アクセス検知)',
          className: 'text-amber-300 font-semibold',
          icon: AlertOctagon
        };
      case 'nominal':
      default:
        return {
          label: '正常稼働 / セキュア待機',
          className: 'text-emerald-400 font-semibold',
          icon: CheckCircle2
        };
    }
  };

  const currentStatus = getStatusDisplay(selectedSite);
  const StatusIcon = currentStatus.icon;

  return (
    <div className="border-b border-slate-800 bg-slate-900/60 px-4 py-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Site Switcher Row */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">監視・復旧対象:</span>
            
            <div className="flex items-center gap-1.5 p-1 bg-slate-950/80 border border-slate-800 rounded-lg">
              {sites.map(site => {
                const isSelected = site.id === selectedSiteId;
                const isSiteLocked = site.status === 'critical_locked';

                return (
                  <button
                    key={site.id}
                    onClick={() => selectSite(site.id)}
                    className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                      isSelected
                        ? isSiteLocked 
                          ? 'bg-rose-950/80 text-rose-200 border border-rose-800/80 shadow-sm'
                          : 'bg-slate-800 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                    }`}
                  >
                    {isSiteLocked && <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />}
                    <span>{site.name}</span>
                    {site.activeThreatCount > 0 && (
                      <span className="font-mono text-[10px] bg-rose-500/30 text-rose-300 px-1.5 py-0.2 rounded font-semibold tabular-nums">
                        {site.activeThreatCount}
                      </span>
                    )}
                  </button>
                );
              })}

              <button
                onClick={() => setIsAddModalOpen(true)}
                title="新しい対象サイトを追加"
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-slate-400 hover:text-cyan-300 hover:bg-slate-900 rounded-md transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">追加</span>
              </button>

              <button
                onClick={() => setActiveTab('site_setup')}
                title="アクセスしたい対象サイトの接続設定とエージェント導入"
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-cyan-400 hover:text-cyan-200 hover:bg-slate-900 rounded-md transition-colors cursor-pointer"
              >
                <span>実サイト接続設定</span>
              </button>
            </div>
          </div>

          {/* Quick Primary Admin Status vs Emergency Route indicator */}
          <div className="flex items-center gap-4 text-xs">
            {selectedSite.isLiveConnected && (
              <span className="font-mono text-emerald-400 text-xs flex items-center gap-1.5 font-medium bg-emerald-950/40 border border-emerald-800/60 px-2 py-0.5 rounded">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                実サイト接続中
              </span>
            )}

            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">標準管理画面:</span>
              {selectedSite.primaryAdminReachable ? (
                <span className="text-emerald-400 font-medium flex items-center gap-1">
                  <Unlock className="w-3.5 h-3.5" />
                  アクセス可能 ({selectedSite.adminPath})
                </span>
              ) : (
                <span className="text-rose-400 font-semibold flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5" />
                  ロック障害 / 接続遮断中
                </span>
              )}
            </div>

            <span className="text-slate-700 hidden sm:inline" aria-hidden="true">|</span>

            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">検証暗号化ルート:</span>
              <span className={selectedSite.emergencyRouteStatus === 'connected' ? 'text-emerald-400 font-mono font-medium' : 'text-cyan-400 font-mono font-medium'}>
                {selectedSite.emergencyRouteStatus === 'connected' ? '直結アクティブ (E2EE)' : '待機中 (スタンバイ)'}
              </span>
            </div>
          </div>
        </div>

        {/* Site Details Bar - Unboxed metadata adhering to Zero-Pill rules */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-y-2 pt-3 border-t border-slate-800/80 text-xs text-slate-400">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-1.5">
              <StatusIcon className={`w-4 h-4 ${currentStatus.className}`} />
              <span className={currentStatus.className}>{currentStatus.label}</span>
            </div>
            
            <span aria-hidden="true" className="text-slate-700">·</span>
            
            <span className="font-mono text-slate-300">{selectedSite.url}</span>
            
            <span aria-hidden="true" className="text-slate-700">·</span>
            
            <span>CMS/基盤: <strong className="text-slate-200 font-normal">{selectedSite.cmsType}</strong></span>
            
            <span aria-hidden="true" className="text-slate-700">·</span>
            
            <span>専用エージェント: <strong className="text-slate-200 font-normal">{selectedSite.agentVersion}</strong></span>
          </div>

          <div className="flex items-center gap-3 font-mono text-[11px] text-slate-400 tabular-nums">
            <span>暗号鍵: {selectedSite.emergencyRouteKeyFingerprint.slice(0, 22)}...</span>
            <span aria-hidden="true" className="text-slate-700">·</span>
            <span>ハートビート: {selectedSite.lastHeartbeat}</span>
            <span aria-hidden="true" className="text-slate-700">·</span>
            <span>遅延: {selectedSite.latencyMs}ms</span>
          </div>
        </div>
      </div>

      <NewSiteModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
    </div>
  );
};
