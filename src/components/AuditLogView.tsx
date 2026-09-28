import React, { useState } from 'react';
import { useSecurity } from '../context/SecurityContext';
import { Shield, Search, FileText, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';

export const AuditLogView: React.FC = () => {
  const { auditLogs, selectedSite } = useSecurity();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSiteOnly, setFilterSiteOnly] = useState(true);

  const displayedLogs = auditLogs.filter(log => {
    if (filterSiteOnly && log.siteId !== selectedSite.id) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        log.action.toLowerCase().includes(q) ||
        log.details.toLowerCase().includes(q) ||
        log.operator.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400">耐改ざん監査証跡</span>
              <span className="text-slate-500">·</span>
              <span className="text-xs text-slate-400 font-mono">CRYPTOGRAPHIC AUDIT LOG</span>
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              緊急リカバリー＆リモートメンテナンス操作の監査台帳
            </h2>
            <p className="text-xs text-slate-400 max-w-3xl leading-relaxed">
              検証専用暗号化ルートで行われたすべてのアクセス、脅威隔離アクション、構成ロールバック、および平時メンテナンスコマンドを暗号化ハッシュチェーンで不変記録しています。
            </p>
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer whitespace-nowrap">
              <input
                type="checkbox"
                checked={filterSiteOnly}
                onChange={(e) => setFilterSiteOnly(e.target.checked)}
                className="rounded border-slate-700 text-cyan-500 focus:ring-cyan-500"
              />
              <span>選択中サイトのみ表示</span>
            </label>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mt-4 relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="監査ログを検索 (アクション名、操作者、ファイルパス)..."
            className="w-full rounded-lg border border-slate-800 bg-slate-950/80 pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Log Entries Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/70 overflow-hidden">
        <div className="divide-y divide-slate-800">
          {displayedLogs.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              一致する監査ログは見つかりませんでした。
            </div>
          ) : (
            displayedLogs.map(log => {
              return (
                <div key={log.id} className="p-4 hover:bg-slate-800/30 transition-colors space-y-1.5">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-cyan-400 font-semibold">{log.action}</span>
                      <span aria-hidden="true" className="text-slate-600">·</span>
                      <span className="text-slate-400 font-mono text-[11px]">{log.channel}</span>
                    </div>

                    <div className="flex items-center gap-2 text-slate-400 font-mono text-[11px] tabular-nums">
                      <span>{log.timestamp}</span>
                      <span aria-hidden="true" className="text-slate-600">·</span>
                      <span className="text-slate-300">{log.operator}</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed font-mono">
                    {log.details}
                  </p>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
