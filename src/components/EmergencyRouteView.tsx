import React, { useState } from 'react';
import { useSecurity } from '../context/SecurityContext';
import { 
  Key, Shield, Radio, RefreshCw, Zap, Lock, Unlock, 
  Terminal, CheckCircle2, AlertTriangle, ArrowRight, Activity, 
  Server, Cpu, Wifi
} from 'lucide-react';

export const EmergencyRouteView: React.FC = () => {
  const { 
    selectedSite, 
    connectEmergencyRoute, 
    disconnectEmergencyRoute, 
    isConnectingEmergencyRoute, 
    addAuditLog 
  } = useSecurity();

  const isConnected = selectedSite.emergencyRouteStatus === 'connected';
  const [isPinging, setIsPinging] = useState(false);
  const [pingResult, setPingResult] = useState<string | null>(null);
  const [handshakeLog, setHandshakeLog] = useState<string[]>([
    'INIT: 検証専用暗号化ルート・エンドポイント初期化済 (198.51.100.24:9443)',
    'CRYPTO: Ed25519公開鍵照合済 (指紋: ' + selectedSite.emergencyRouteKeyFingerprint + ')',
    'POLICY: アウトオブバンド管理チャンネル・待機中'
  ]);

  const handleTestProbe = async () => {
    setIsPinging(true);
    setPingResult(null);

    await new Promise(r => setTimeout(r, 800));

    setPingResult('RTT 14.2ms / パケット損失 0% / 暗号化署名検証 成功 (Mutual TLS 1.3 OK)');
    setIsPinging(false);

    setHandshakeLog(prev => [
      `[${new Date().toLocaleTimeString('ja-JP')}] PROBE_CHECK: 暗号化ルート疎通確認完了 - 遅延 14.2ms - 整合性 100%`,
      ...prev
    ]);

    addAuditLog({
      siteId: selectedSite.id,
      operator: 'セキュリティオペレーター',
      channel: 'Emergency Encrypted Route',
      action: '暗号化ルート疎通・レイテンシ測定プローブ',
      status: 'success',
      details: '検証専用ルートのエンドツーエンド疎通を確認。暗号署名検証成功。'
    });
  };

  return (
    <div className="space-y-6">
      {/* Overview and Status */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400">暗号化通信路の制御</span>
              <span className="text-slate-500">·</span>
              <span className="text-xs text-slate-400 font-mono">ENCRYPTED OUT-OF-BAND TUNNEL</span>
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              検証専用暗号化ルート（管理画面バイパス直結チャネル）
            </h2>
            <p className="text-xs text-slate-400 max-w-3xl leading-relaxed">
              HTTPサーバーのフリーズ、管理画面（{selectedSite.adminPath}）のロックアウト、WAFの誤遮断等に一切影響されない、事前定義された署名ベースの暗号化直結ルートです。
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {isConnected ? (
              <button
                onClick={() => disconnectEmergencyRoute(selectedSite.id)}
                className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-rose-300 bg-rose-950/40 border border-rose-800/80 rounded-lg hover:bg-rose-900/60 transition-colors cursor-pointer"
              >
                <span>接続を切断して待機へ戻す</span>
              </button>
            ) : (
              <button
                onClick={() => connectEmergencyRoute(selectedSite.id)}
                disabled={isConnectingEmergencyRoute}
                className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 rounded-lg shadow-sm transition-colors cursor-pointer"
              >
                {isConnectingEmergencyRoute ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>セキュアハンドシェイク中...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-3.5 h-3.5" />
                    <span>暗号化ルートを即座に確立</span>
                  </>
                )}
              </button>
            )}

            <button
              onClick={handleTestProbe}
              disabled={isPinging}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors cursor-pointer"
            >
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              <span>{isPinging ? 'プローブ中...' : '疎通プローブ測定'}</span>
            </button>
          </div>
        </div>

        {pingResult && (
          <div className="mt-4 p-3 rounded-lg bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-xs font-mono flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{pingResult}</span>
            </div>
            <span className="text-[11px] text-emerald-400/80">検証済暗号鍵ピン留め有効</span>
          </div>
        )}
      </div>

      {/* Technical Specifications Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5 space-y-3">
          <div className="flex items-center gap-2 text-slate-300 text-xs font-semibold uppercase tracking-wider">
            <Key className="w-4 h-4 text-cyan-400" />
            <span>署名検証＆暗号鍵</span>
          </div>
          <div className="space-y-2 text-xs">
            <div>
              <span className="text-slate-400 text-[11px]">鍵交換・アルゴリズム:</span>
              <p className="font-mono text-slate-200 mt-0.5">X25519 / ChaCha20-Poly1305</p>
            </div>
            <div>
              <span className="text-slate-400 text-[11px]">エージェント公開鍵指紋:</span>
              <p className="font-mono text-xs text-cyan-300 mt-0.5 break-all">
                {selectedSite.emergencyRouteKeyFingerprint}
              </p>
            </div>
            <div>
              <span className="text-slate-400 text-[11px]">相互認証 (mTLS):</span>
              <p className="text-emerald-400 mt-0.5 font-medium">双方向証明書ピン留め有効</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5 space-y-3">
          <div className="flex items-center gap-2 text-slate-300 text-xs font-semibold uppercase tracking-wider">
            <Wifi className="w-4 h-4 text-cyan-400" />
            <span>ネットワーク経路・ゲートウェイ</span>
          </div>
          <div className="space-y-2 text-xs">
            <div>
              <span className="text-slate-400 text-[11px]">専用エントリポイントIP:</span>
              <p className="font-mono text-slate-200 mt-0.5">{selectedSite.emergencyRouteIp}</p>
            </div>
            <div>
              <span className="text-slate-400 text-[11px]">隔離ポート:</span>
              <p className="font-mono text-slate-200 mt-0.5">TCP 9443 (Out-of-band専用)</p>
            </div>
            <div>
              <span className="text-slate-400 text-[11px]">パブリックWebスタック迂回:</span>
              <p className="text-emerald-400 mt-0.5 font-medium">Webサーバー/WAF完全独立バイパス</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5 space-y-3">
          <div className="flex items-center gap-2 text-slate-300 text-xs font-semibold uppercase tracking-wider">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span>サンドボックス・隔離権限</span>
          </div>
          <div className="space-y-2 text-xs">
            <div>
              <span className="text-slate-400 text-[11px]">実行コンテキスト:</span>
              <p className="font-mono text-slate-200 mt-0.5">aegis-sentinel 独立デーモン</p>
            </div>
            <div>
              <span className="text-slate-400 text-[11px]">不具合時フェイルセーフ:</span>
              <p className="text-slate-200 mt-0.5">リードオンリー + 復旧コマンド許可</p>
            </div>
            <div>
              <span className="text-slate-400 text-[11px]">セッション失効制限:</span>
              <p className="text-slate-200 mt-0.5">アイドル15分で自動再認証</p>
            </div>
          </div>
        </div>
      </div>

      {/* Live Handshake and Route Diagnostics Feed */}
      <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-5 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-cyan-400" />
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
              暗号化ルート・リアルタイム接続テレメトリ
            </h4>
          </div>
          <span className="text-[11px] font-mono text-slate-500">AUTHENTICATED PROTOCOL v2.4</span>
        </div>

        <div className="font-mono text-xs text-slate-300 space-y-1.5 max-h-56 overflow-y-auto p-3 bg-slate-900/50 rounded-lg border border-slate-800/80">
          {handshakeLog.map((log, idx) => (
            <div key={idx} className="flex items-start gap-2">
              <span className="text-cyan-400 select-none">&gt;</span>
              <span className="leading-relaxed">{log}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
