import React, { useState } from 'react';
import { useSecurity } from '../context/SecurityContext';
import { 
  ShieldAlert, ShieldCheck, Zap, AlertTriangle, RefreshCw, 
  FileCode, UserX, RotateCcw, Lock, Unlock, CheckCircle2,
  Terminal, ArrowRight, Activity, Server, Radio
} from 'lucide-react';

export const IncidentRecoveryView: React.FC = () => {
  const { 
    selectedSite, 
    vulnerabilities, 
    neutralizeVulnerability, 
    neutralizeAllThreats, 
    isSimulatingRecovery,
    connectEmergencyRoute,
    isConnectingEmergencyRoute,
    setActiveTab,
    simulateLockoutIncident
  } = useSecurity();

  const siteVulns = vulnerabilities.filter(v => v.siteId === selectedSite.id);
  const activeVulns = siteVulns.filter(v => !v.isNeutralized);
  const neutralizedVulns = siteVulns.filter(v => v.isNeutralized);

  const isLocked = selectedSite.status === 'critical_locked';
  const isRouteConnected = selectedSite.emergencyRouteStatus === 'connected';

  const [activeStep, setActiveStep] = useState<number>(isLocked ? 1 : 3);

  return (
    <div className="space-y-6">
      {/* Primary Emergency Banner if Locked */}
      {isLocked ? (
        <div className="rounded-xl border border-rose-800/80 bg-rose-950/40 p-6 text-slate-100 shadow-xl backdrop-blur-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-rose-900/60 border border-rose-700/60 text-rose-300 shrink-0">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-rose-300">緊急インシデント検知</span>
                  <span className="text-slate-500">·</span>
                  <span className="text-xs text-rose-300/80 font-mono">CODE: ADMIN_LOCKOUT_SUSPECTED</span>
                </div>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  管理画面のロック障害および不正アクセスポイントが検知されました
                </h2>
                <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
                  対象サイトの通常管理エンドポイント（{selectedSite.adminPath}）がHTTP 503/アクセス拒否により操作不能になっています。あらかじめ用意された検証専用暗号化ルートから直結し、原因となっている不正ファイルを隔離して通常運用へリカバリーします。
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              {!isRouteConnected ? (
                <button
                  onClick={() => connectEmergencyRoute(selectedSite.id)}
                  disabled={isConnectingEmergencyRoute}
                  className="flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-lg shadow-lg shadow-rose-950/60 transition-all cursor-pointer whitespace-nowrap"
                >
                  {isConnectingEmergencyRoute ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>検証暗号化ルート接続中...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      <span>検証暗号化ルートを起動</span>
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={() => neutralizeAllThreats(selectedSite.id)}
                  disabled={isSimulatingRecovery}
                  className="flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-lg shadow-emerald-950/60 transition-all cursor-pointer whitespace-nowrap"
                >
                  {isSimulatingRecovery ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>リカバリー・無効化処理実行中...</span>
                    </>
                  ) : (
                    <>
                      <RotateCcw className="w-4 h-4" />
                      <span>全原因の一括無効化＆リカバリー</span>
                    </>
                  )}
                </button>
              )}

              <button
                type="button"
                onClick={() => window.dispatchEvent(new CustomEvent('open_instagram_modal'))}
                title="障害発生時の外部連絡・SNS告知・公式アカウント確認"
                className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold text-white bg-gradient-to-r from-amber-600 via-rose-600 to-purple-600 hover:opacity-90 rounded-lg shadow-sm transition-all cursor-pointer whitespace-nowrap"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
                <span>ロック中もInstagramを開く</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-emerald-950/60 border border-emerald-800/60 text-emerald-400 shrink-0">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">システム正常化完了</span>
                  <span className="text-slate-500">·</span>
                  <span className="text-xs text-slate-400 font-mono">STATUS: NOMINAL</span>
                </div>
                <h2 className="text-lg font-bold text-white tracking-tight">
                  管理画面は正常にアクセス可能であり、潜在的脅威は検知されていません
                </h2>
                <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">
                  平時においても、検証専用暗号化ルートは高セキュリティな遠隔保守・監査アクセスパイプとして常時待機しています。
                </p>
              </div>
            </div>

            <button
              onClick={() => simulateLockoutIncident(selectedSite.id)}
              className="flex items-center justify-center gap-2 px-4 py-2 text-xs font-medium text-amber-300 bg-amber-950/40 border border-amber-800/80 rounded-lg hover:bg-amber-900/50 transition-colors cursor-pointer whitespace-nowrap"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>障害・ロックアウト状況を再現テスト</span>
            </button>
          </div>
        </div>
      )}

      {/* 2-Zone Comparison Grid: Normal Route vs Emergency Encrypted Route */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Normal Admin Gateway Status */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <Server className="w-4 h-4 text-slate-400" />
              <h3 className="text-sm font-semibold text-slate-200">標準HTTP/HTTPS 管理画面エンドポイント</h3>
            </div>
            {selectedSite.primaryAdminReachable ? (
              <span className="text-xs font-medium text-emerald-400 flex items-center gap-1">
                <Unlock className="w-3.5 h-3.5" />
                正常稼働 (200 OK)
              </span>
            ) : (
              <span className="text-xs font-semibold text-rose-400 flex items-center gap-1">
                <Lock className="w-3.5 h-3.5" />
                操作不能 / ロック中 (503 Service Unavailable)
              </span>
            )}
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">対象管理画面URL:</span>
              <span className="font-mono text-slate-200">{selectedSite.url}{selectedSite.adminPath}</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">HTTP応答ステータス:</span>
              <span className="font-mono tabular-nums text-slate-200">
                {selectedSite.primaryAdminReachable ? 'HTTP/2 200 OK' : 'HTTP/1.1 503 Backend Hang / Redirect Loop'}
              </span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">認証プロテクション状態:</span>
              <span className="text-slate-300">
                {selectedSite.primaryAdminReachable ? '標準セッションガード適用中' : '改ざんRewrite規則により外部プロキシへ奪取の恐れ'}
              </span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-slate-400">影響範囲:</span>
              <span className="text-slate-300">
                {selectedSite.primaryAdminReachable ? '影響なし' : '一般管理者のログイン不能、緊急復旧オペレーションの遮断'}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Emergency Encrypted Route Status */}
        <div className="rounded-xl border border-cyan-900/60 bg-cyan-950/20 p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-cyan-900/40 pb-3">
            <div className="flex items-center gap-2.5">
              <Radio className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-semibold text-cyan-200">あらかじめ用意された検証専用暗号化ルート</h3>
            </div>
            <span className={`text-xs font-mono font-medium ${isRouteConnected ? 'text-emerald-400' : 'text-cyan-400'}`}>
              {isRouteConnected ? '暗号化トンネル確立済' : '待機中 (スタンバイ)'}
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between py-1 border-b border-cyan-900/30">
              <span className="text-slate-400">暗号化プロトコル:</span>
              <span className="font-mono text-cyan-300">Mutual TLS 1.3 / ChaCha20-Poly1305</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-cyan-900/30">
              <span className="text-slate-400">検証鍵ペア署名:</span>
              <span className="font-mono text-slate-300">{selectedSite.emergencyRouteKeyFingerprint}</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-cyan-900/30">
              <span className="text-slate-400">専用ルートIP・ゲートウェイ:</span>
              <span className="font-mono text-slate-300">{selectedSite.emergencyRouteIp}</span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-slate-400">復旧コマンド権限:</span>
              <span className="text-emerald-400 font-medium">エージェント分離隔離モード (特権サンドボックス)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Threat Invalidation & Recovery Management Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/70 overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 px-6 py-4">
          <div>
            <h3 className="text-sm font-semibold text-white tracking-tight">
              検知された不正アクセスポイント・不具合原因と無効化アクション
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              暗号化ルートから個別の脅威をワンクリックで隔離またはロールバック可能です
            </p>
          </div>

          {activeVulns.length > 0 && isRouteConnected && (
            <button
              onClick={() => neutralizeAllThreats(selectedSite.id)}
              disabled={isSimulatingRecovery}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-lg shadow-sm transition-colors cursor-pointer shrink-0"
            >
              {isSimulatingRecovery ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>処理中...</span>
                </>
              ) : (
                <>
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>検知要因を一括無効化 ({activeVulns.length}件)</span>
                </>
              )}
            </button>
          )}
        </div>

        {siteVulns.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            検知された脆弱性や不正要因はありません。正常に保たれています。
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {siteVulns.map(vuln => {
              return (
                <div 
                  key={vuln.id} 
                  className={`p-5 transition-colors ${vuln.isNeutralized ? 'bg-slate-950/40 opacity-70' : 'hover:bg-slate-800/30'}`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        {vuln.isNeutralized ? (
                          <span className="font-semibold text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            無効化・隔離完了
                          </span>
                        ) : (
                          <span className="font-semibold text-rose-400 flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            未無効化 (アクティブな脅威)
                          </span>
                        )}
                        <span aria-hidden="true" className="text-slate-600">·</span>
                        <span className="font-mono text-slate-400">{vuln.type.toUpperCase()}</span>
                        <span aria-hidden="true" className="text-slate-600">·</span>
                        <span className="text-slate-400">検知: {vuln.detectedAt}</span>
                      </div>

                      <h4 className="text-sm font-semibold text-slate-100">{vuln.title}</h4>
                      <p className="text-xs text-slate-400 leading-relaxed">{vuln.description}</p>
                      
                      <div className="pt-1 font-mono text-[11px] text-slate-400 bg-slate-950/80 border border-slate-800 rounded p-2 overflow-x-auto">
                        <div className="text-slate-500 mb-0.5">対象パス: {vuln.targetPath}</div>
                        <div className="text-rose-300 font-medium">{vuln.evidence}</div>
                      </div>

                      <div className="text-xs text-cyan-300/90 pt-1">
                        推奨リカバリー: {vuln.recommendedAction}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 lg:self-center">
                      {vuln.isNeutralized ? (
                        <div className="text-right text-xs text-slate-400">
                          <span className="text-emerald-400 font-medium">隔離済 ({vuln.neutralizedAt})</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            if (!isRouteConnected) {
                              connectEmergencyRoute(selectedSite.id).then(() => {
                                neutralizeVulnerability(vuln.id);
                              });
                            } else {
                              neutralizeVulnerability(vuln.id);
                            }
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-800 hover:bg-rose-600 border border-slate-700 hover:border-rose-500 rounded-lg transition-colors cursor-pointer"
                        >
                          <Zap className="w-3.5 h-3.5" />
                          <span>即時無効化・リカバリー</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recovery Process Playbook / Mechanism to Outcome */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 space-y-4">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
          管理画面ロック発生時の自動リカバリー・メカニズムフロー
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          <div className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-slate-400 font-mono">
              <span className="text-cyan-400 font-bold">01</span>
              <span>障害検知</span>
            </div>
            <h5 className="font-semibold text-slate-200">異常の自動特定</h5>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              通常の管理URLへのアクセス遮断や改ざんレスポンスを検出し、即座に緊急フェーズへ移行。
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-slate-400 font-mono">
              <span className="text-cyan-400 font-bold">02</span>
              <span>暗号化ルート確立</span>
            </div>
            <h5 className="font-semibold text-slate-200">検証専用パイプ接続</h5>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              HTTPサーバーやWebポートの不具合を迂回し、Mutual TLSで安全にサーバー内部へ直結。
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-slate-400 font-mono">
              <span className="text-cyan-400 font-bold">03</span>
              <span>不正要因の無効化</span>
            </div>
            <h5 className="font-semibold text-slate-200">隔離とロールバック</h5>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Webシェル隔離、不正管理者のアカウント抹消、.htaccess/Nginx構成の整合性復元を実行。
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-slate-400 font-mono">
              <span className="text-emerald-400 font-bold">04</span>
              <span>正常化検証</span>
            </div>
            <h5 className="font-semibold text-slate-200">管理アクセス再開</h5>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              ヘルスチェックを通過後、管理画面アクセスを安全に再開。監査ログを暗号化チェーンに記録。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
