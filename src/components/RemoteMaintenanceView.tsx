import React, { useState } from 'react';
import { useSecurity } from '../context/SecurityContext';
import { 
  Terminal, ShieldCheck, Database, RefreshCw, HardDrive, 
  Key, Lock, CheckCircle2, Play, Activity, Clock
} from 'lucide-react';

interface MaintenanceTask {
  id: string;
  name: string;
  command: string;
  description: string;
  lastRun: string;
  status: 'nominal' | 'success';
}

export const RemoteMaintenanceView: React.FC = () => {
  const { selectedSite, addAuditLog } = useSecurity();
  const [terminalInput, setTerminalInput] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [terminalHistory, setTerminalHistory] = useState<string[]>([
    `[${selectedSite.name}] AegisRoute Zero-Trust Maintenance Console`,
    `Connected via Mutual TLS 1.3 / Authenticated Channel (Latency: ${selectedSite.latencyMs}ms)`,
    `Type "help" or click standard maintenance tasks below to run secure operations.`
  ]);

  const maintenanceTasks: MaintenanceTask[] = [
    {
      id: 'task-cache',
      name: 'セキュア・キャッシュパージ',
      command: 'aegis-maint cache:purge --all',
      description: 'Redis/Memcached/ObjectCacheの安全なフラッシュとセッション整合性の再検証',
      lastRun: '2026-09-27 12:00',
      status: 'nominal'
    },
    {
      id: 'task-db',
      name: 'データベース整合性チェック＆最適化',
      command: 'aegis-maint db:health --optimize',
      description: 'インデックスの破損検知、オーファンテーブルの監査、クエリ健全性テスト',
      lastRun: '2026-09-27 03:00',
      status: 'nominal'
    },
    {
      id: 'task-backup',
      name: '暗号化スナップショット・バックアップ',
      command: 'aegis-maint backup:snapshot --encrypt-aes256',
      description: 'データベースおよび重要構成ファイルのAES-256暗号化スナップショット即時生成',
      lastRun: '2026-09-27 04:30',
      status: 'nominal'
    },
    {
      id: 'task-cert',
      name: 'TLS証明書・鍵失効チェック',
      command: 'aegis-maint cert:audit-revocation',
      description: 'Let\'s Encrypt / 内部ルートCA証明書有効期限およびOCSP Stapling監査',
      lastRun: '2026-09-26 18:00',
      status: 'nominal'
    }
  ];

  const executeCommand = async (cmd: string) => {
    if (!cmd.trim()) return;

    setIsExecuting(true);
    setTerminalHistory(prev => [...prev, `$ ${cmd}`]);

    await new Promise(r => setTimeout(r, 600));

    let output = '';
    const cleanCmd = cmd.trim().toLowerCase();

    if (cleanCmd.includes('help')) {
      output = `利用可能なコマンド一覧:
  aegis-maint status                - エージェントおよび接続健全性の確認
  aegis-maint cache:purge           - アプリケーションキャッシュの安全なパージ
  aegis-maint db:health             - データベース接続＆整合性チェック
  aegis-maint backup:snapshot       - 暗号化バックアップスナップショット生成
  aegis-maint cert:audit-revocation - TLS証明書の有効期限と失効検証
  aegis-maint integrity:verify     - ファイル改ざん有無の高速照合
  clear                             - 画面クリア`;
    } else if (cleanCmd.includes('clear')) {
      setTerminalHistory([]);
      setIsExecuting(false);
      return;
    } else if (cleanCmd.includes('status')) {
      output = `[STATUS OK] 対象サイト: ${selectedSite.url}
  暗号化ルート: ${selectedSite.emergencyRouteStatus.toUpperCase()}
  エージェント稼働バージョン: ${selectedSite.agentVersion}
  平時セキュリティ監査: 通過 (脅威検知: ${selectedSite.activeThreatCount}件)
  最終ハンドシェイク: ${selectedSite.lastHeartbeat}`;
    } else if (cleanCmd.includes('cache')) {
      output = `[CACHE PURGE] 完了:
  - Redis キー 1,420件を正常パージ
  - OPcache リセットシグナル送信完了
  - 応答速度: 正常 (TTFB 42ms)`;
    } else if (cleanCmd.includes('db')) {
      output = `[DB HEALTH] チェック完了:
  - 接続プール: 正常 (アクティブ: 4, アイドル: 16)
  - テーブル破損: 0件
  - スロークエリ: 検出なし`;
    } else if (cleanCmd.includes('backup')) {
      output = `[BACKUP CREATED]
  - スナップショットID: snap_20260927_${Date.now().toString().slice(-6)}
  - 暗号化: AES-256-GCM (SHA-256チェックサム署名済)
  - 保存先: /var/backups/aegis-snapshots/`;
    } else {
      output = `[SUCCESS] コマンド "${cmd}" を安全に実行しました。
  リターンコード: 0 (正常終了)
  実行コンテキスト: aegis-maint sandbox (権限制限モード)`;
    }

    setTerminalHistory(prev => [...prev, output]);
    setIsExecuting(false);
    setTerminalInput('');

    addAuditLog({
      siteId: selectedSite.id,
      operator: '認証済メンテナンスオペレーター',
      channel: 'Console Zero-Trust',
      action: `リモートメンテナンスコマンド実行: ${cmd}`,
      status: 'success',
      details: 'ゼロトラスト暗号化チャネル経由での保守コマンドを安全に適用しました。'
    });
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeCommand(terminalInput);
  };

  return (
    <div className="space-y-6">
      {/* Maintenance Header */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">平時運用・安全アクセス</span>
            <span className="text-slate-500">·</span>
            <span className="text-xs text-slate-400 font-mono">ZERO-TRUST REMOTE MAINTENANCE</span>
          </div>
          <h2 className="text-lg font-bold text-white tracking-tight">
            平時における高セキュリティ・リモートメンテナンス環境
          </h2>
          <p className="text-xs text-slate-400 max-w-3xl leading-relaxed">
            システムに異常が検知されない平時においても、脆弱なパブリックSSHポートを開放することなく、検証専用暗号化ルートを介してキャッシュクリア、DB保守、バックアップ等の日常メンテナンスを安全に実施できます。
          </p>
        </div>
      </div>

      {/* Routine Quick Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {maintenanceTasks.map(task => (
          <div 
            key={task.id}
            className="rounded-xl border border-slate-800 bg-slate-900/50 p-5 space-y-3 hover:border-slate-700 transition-colors"
          >
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-slate-200">{task.name}</h4>
              <button
                onClick={() => executeCommand(task.command)}
                disabled={isExecuting}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-cyan-300 bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-800/60 rounded-lg transition-colors cursor-pointer"
              >
                <Play className="w-3 h-3" />
                <span>即時実行</span>
              </button>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">{task.description}</p>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[11px] text-slate-500 font-mono">
              <span>コマンド: {task.command}</span>
              <span>最終実行: {task.lastRun}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Interactive Zero-Trust Maintenance Terminal */}
      <div className="rounded-xl border border-slate-800 bg-slate-950 overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/80 px-4 py-2.5">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-semibold text-slate-300">
              ゼロトラスト・リモートメンテナンス ターミナル
            </span>
          </div>
          <span className="text-[11px] font-mono text-slate-500">SANDBOX SHELL (E2E-ENCRYPTED)</span>
        </div>

        {/* Terminal Screen */}
        <div className="p-4 font-mono text-xs text-slate-300 space-y-1.5 min-h-[240px] max-h-[380px] overflow-y-auto">
          {terminalHistory.map((line, idx) => (
            <div key={idx} className="whitespace-pre-wrap leading-relaxed">
              {line.startsWith('$') ? (
                <span className="text-cyan-400 font-semibold">{line}</span>
              ) : line.startsWith('[SUCCESS]') || line.startsWith('[STATUS OK]') ? (
                <span className="text-emerald-400">{line}</span>
              ) : (
                <span className="text-slate-300">{line}</span>
              )}
            </div>
          ))}
          {isExecuting && (
            <div className="flex items-center gap-2 text-cyan-400">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>暗号化チャネル経由でコマンドをディスパッチ中...</span>
            </div>
          )}
        </div>

        {/* Terminal Input Bar */}
        <form onSubmit={handleFormSubmit} className="flex items-center border-t border-slate-800 bg-slate-900/60 p-2 gap-2">
          <span className="text-cyan-400 pl-2 font-mono text-xs select-none">$</span>
          <input
            type="text"
            value={terminalInput}
            onChange={(e) => setTerminalInput(e.target.value)}
            placeholder="コマンドを入力 (例: aegis-maint status, cache:purge, help)..."
            className="flex-1 bg-transparent px-2 py-1 text-xs font-mono text-white placeholder-slate-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={isExecuting || !terminalInput.trim()}
            className="px-3 py-1.5 text-xs font-medium text-white bg-slate-800 hover:bg-slate-700 rounded transition-colors cursor-pointer disabled:opacity-50"
          >
            実行
          </button>
        </form>
      </div>
    </div>
  );
};
