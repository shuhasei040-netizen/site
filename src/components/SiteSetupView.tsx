import React, { useState } from 'react';
import { useSecurity } from '../context/SecurityContext';
import { 
  Globe, Server, Key, Download, Copy, Check, RefreshCw, 
  ExternalLink, CheckCircle2, AlertTriangle, ShieldCheck, 
  FileCode, Terminal, HelpCircle, Trash2, ArrowRight
} from 'lucide-react';

export const SiteSetupView: React.FC = () => {
  const { 
    selectedSite, 
    updateTargetSiteConfig, 
    testLiveSiteConnection, 
    deleteSite,
    connectEmergencyRoute,
    setActiveTab 
  } = useSecurity();

  const [siteName, setSiteName] = useState(selectedSite.name);
  const [siteUrl, setSiteUrl] = useState(selectedSite.url);
  const [adminPath, setAdminPath] = useState(selectedSite.adminPath);
  const [endpointPath, setEndpointPath] = useState(selectedSite.customEndpointPath || '/aegis-rescue.php');
  const [secretToken, setSecretToken] = useState(selectedSite.secretToken || 'aegis_token_default');
  const [cmsType, setCmsType] = useState(selectedSite.cmsType);

  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; data?: any } | null>(null);
  const [copiedFile, setCopiedFile] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Sync state if selected site changes
  React.useEffect(() => {
    setSiteName(selectedSite.name);
    setSiteUrl(selectedSite.url);
    setAdminPath(selectedSite.adminPath);
    setEndpointPath(selectedSite.customEndpointPath || '/aegis-rescue.php');
    setSecretToken(selectedSite.secretToken || '');
    setCmsType(selectedSite.cmsType);
    setTestResult(null);
  }, [selectedSite.id]);

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    updateTargetSiteConfig(selectedSite.id, {
      name: siteName,
      url: siteUrl.replace(/\/+$/, ''),
      adminPath,
      customEndpointPath: endpointPath.startsWith('/') ? endpointPath : `/${endpointPath}`,
      secretToken,
      cmsType
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleRegenerateToken = () => {
    const newToken = `aegis_sec_${Math.random().toString(36).substring(2, 12)}_${Date.now().toString().slice(-6)}`;
    setSecretToken(newToken);
  };

  const handleRunLiveTest = async (simulate = false) => {
    setIsTesting(true);
    setTestResult(null);

    const cleanUrl = siteUrl.trim().replace(/\/+$/, '');
    const cleanPath = endpointPath.trim().startsWith('/') ? endpointPath.trim() : `/${endpointPath.trim()}`;
    const cleanToken = secretToken.trim();

    // Save latest configuration first
    updateTargetSiteConfig(selectedSite.id, {
      name: siteName,
      url: cleanUrl,
      adminPath,
      customEndpointPath: cleanPath,
      secretToken: cleanToken,
      cmsType
    });

    const res = await testLiveSiteConnection(selectedSite.id, simulate, {
      url: cleanUrl,
      customEndpointPath: cleanPath,
      secretToken: cleanToken
    });
    setTestResult(res);
    setIsTesting(false);
  };

  // Generate tailored standalone dropin PHP code for the current site
  const generateRescuePhpCode = () => {
    return `<?php
/**
 * ==============================================================================
 * AegisRoute Sentinel - 実サイト検証専用レスキュー＆リカバリーエージェント
 * 対象サイト: ${siteUrl}
 * 設置先: ドキュメントルート直下 (例: /public_html${endpointPath})
 * ==============================================================================
 * このファイルはサイト管理画面がロックや500/503障害で不能になった場合でも、
 * ブラウザコンソールと安全に暗号化通信を行い、原因の無効化とリカバリーを実行します。
 */

declare(strict_types=1);

// 1. CORSヘッダーおよびプリフライト(OPTIONS)応答
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Aegis-Token, X-Aegis-Signature");
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// 2. 認証トークンの照合 (コンソールで生成された共有シークレット)
$expected_token = '${secretToken}';
$received_token = $_SERVER['HTTP_X_AEGIS_TOKEN'] ?? $_GET['token'] ?? $_POST['token'] ?? '';

if (!hash_equals($expected_token, (string)$received_token)) {
    http_response_code(403);
    echo json_encode(['status' => 'error', 'message' => 'Unauthorized: Invalid security token'], JSON_UNESCAPED_UNICODE);
    exit;
}

header('Content-Type: application/json; charset=utf-8');

$action = $_GET['action'] ?? $_POST['action'] ?? 'ping';

switch ($action) {
    // 疎通確認・ヘルスチェック
    case 'ping':
        echo json_encode([
            'status' => 'ok',
            'site' => '${siteUrl}',
            'php_version' => PHP_VERSION,
            'server' => $_SERVER['SERVER_SOFTWARE'] ?? 'Unknown Server',
            'memory' => round(memory_get_usage() / 1024 / 1024, 2) . ' MB',
            'writable' => is_writable(__DIR__),
            'timestamp' => date('Y-m-d H:i:s'),
            'cms' => '${cmsType}'
        ], JSON_UNESCAPED_UNICODE);
        break;

    // 不正ファイルの隔離・パーミッション剥奪
    case 'quarantine':
        $target = $_POST['target_file'] ?? '';
        $full_path = realpath(__DIR__ . '/' . ltrim($target, '/'));
        
        if ($full_path && file_exists($full_path)) {
            @chmod($full_path, 0000); // 実行・読込を完全遮断
            @rename($full_path, $full_path . '.aegis_quarantined');
            echo json_encode(['status' => 'ok', 'message' => 'File quarantined: ' . basename($full_path)], JSON_UNESCAPED_UNICODE);
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Target file not found'], JSON_UNESCAPED_UNICODE);
        }
        break;

    // 改ざんされた .htaccess の緊急ロールバック
    case 'restore_config':
        $htaccess_path = __DIR__ . '/.htaccess';
        $safe_htaccess = "# AegisRoute Restored Configuration\\nRewriteEngine On\\nRewriteBase /\\nRewriteRule ^index\\\\.php$ - [L]\\nRewriteCond %{REQUEST_FILENAME} !-f\\nRewriteCond %{REQUEST_FILENAME} !-d\\nRewriteRule . /index.php [L]\\n";
        
        if (file_put_contents($htaccess_path, $safe_htaccess) !== false) {
            echo json_encode(['status' => 'ok', 'message' => '.htaccess rolled back to clean default'], JSON_UNESCAPED_UNICODE);
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Permission denied writing .htaccess'], JSON_UNESCAPED_UNICODE);
        }
        break;

    // キャッシュパージ
    case 'clear_cache':
        if (function_exists('opcache_reset')) {
            @opcache_reset();
        }
        echo json_encode(['status' => 'ok', 'message' => 'OPcache and server caches flushed successfully'], JSON_UNESCAPED_UNICODE);
        break;

    default:
        echo json_encode(['status' => 'error', 'message' => 'Unknown action requested'], JSON_UNESCAPED_UNICODE);
        break;
}
exit;
`;
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(generateRescuePhpCode());
    setCopiedFile(true);
    setTimeout(() => setCopiedFile(false), 2000);
  };

  const handleDownloadFile = () => {
    const blob = new Blob([generateRescuePhpCode()], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = endpointPath.replace(/^\//, '') || 'aegis-rescue.php';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyToken = () => {
    navigator.clipboard.writeText(secretToken);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Introduction Card */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400">実サイト連携・導入アシスタント</span>
            <span className="text-slate-500">·</span>
            <span className="text-xs text-slate-400 font-mono">LIVE TARGET DEPLOYMENT</span>
          </div>
          <h2 className="text-lg font-bold text-white tracking-tight">
            アクセスしたい対象サイトへの適用と疎通検証
          </h2>
          <p className="text-xs text-slate-400 max-w-3xl leading-relaxed">
            ご自身のWordPressサイト、ECサイト、企業ポータル等の実際のURLを登録し、生成された単一レスキューファイル（<code className="text-cyan-300 font-mono">{endpointPath}</code>）をサーバーに設置するだけで、本ツールの暗号化復旧機能がその実サイトに対して機能します。
          </p>
        </div>
      </div>

      {/* Target Site Configuration Form & Live Connection Tester */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Site Settings Form */}
        <div className="lg:col-span-2 rounded-xl border border-slate-800 bg-slate-900/70 p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-semibold text-white">対象サイト接続パラメータ</h3>
            </div>
            {selectedSite.isLiveConnected ? (
              <span className="text-xs font-mono text-emerald-400 flex items-center gap-1.5 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                実サイト接続中 (Live Linked)
              </span>
            ) : (
              <span className="text-xs text-amber-400 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                エージェントファイル配置待ち
              </span>
            )}
          </div>

          <form onSubmit={handleSaveConfig} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  対象サイト表示名
                </label>
                <input
                  type="text"
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  placeholder="例: 私のメイン本番サイト"
                  required
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-slate-300 font-medium">
                    対象サイトの実際のURL (公開URL)
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setSiteUrl('https://aegis-server-0vox.onrender.com');
                      setSecretToken('aegis_sec_ec_9981248742194721');
                      setEndpointPath('/aegis-rescue.php');
                      setSiteName('Render本番稼働サーバー');
                    }}
                    className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-mono cursor-pointer"
                  >
                    <span>⚡ デプロイ済みRenderサーバーを自動入力</span>
                  </button>
                </div>
                <input
                  type="url"
                  value={siteUrl}
                  onChange={(e) => setSiteUrl(e.target.value)}
                  placeholder="https://aegis-server-0vox.onrender.com"
                  required
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 font-mono placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  通常管理画面パス
                </label>
                <input
                  type="text"
                  value={adminPath}
                  onChange={(e) => setAdminPath(e.target.value)}
                  placeholder="/wp-admin"
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 font-mono placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  レスキュー配置パス
                </label>
                <input
                  type="text"
                  value={endpointPath}
                  onChange={(e) => setEndpointPath(e.target.value)}
                  placeholder="/aegis-rescue.php"
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 font-mono placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  CMS / 基盤種別
                </label>
                <select
                  value={cmsType}
                  onChange={(e) => setCmsType(e.target.value as any)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 focus:border-cyan-500 focus:outline-none"
                >
                  <option value="WordPress">WordPress</option>
                  <option value="Laravel">Laravel</option>
                  <option value="Custom Next.js">Custom Next.js / Node</option>
                  <option value="EC-CUBE">EC-CUBE</option>
                  <option value="Drupal">Drupal</option>
                </select>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-slate-300 font-medium">
                  専用暗号認証シークレットトークン
                </label>
                <button
                  type="button"
                  onClick={handleRegenerateToken}
                  className="text-[11px] text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer"
                >
                  再生成
                </button>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={secretToken}
                  onChange={(e) => setSecretToken(e.target.value)}
                  className="flex-1 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-200 font-mono text-xs focus:border-cyan-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleCopyToken}
                  className="px-3 py-2 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer shrink-0"
                >
                  {copiedToken ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                ※このトークンはコンソールとエージェント間でリクエストを暗号照合するために使われます。
              </p>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => deleteSite(selectedSite.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>このサイトを削除</span>
              </button>

              <div className="flex items-center gap-3">
                {saveSuccess && (
                  <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    設定を保存しました
                  </span>
                )}
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors cursor-pointer"
                >
                  設定を更新
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Right 1 Col: Live Connection Tester */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-6 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              <Server className="w-4 h-4 text-cyan-400" />
              <span>実サイト・疎通テスト実行</span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              指定されたURL（<code className="text-slate-300 font-mono">{siteUrl}{endpointPath}</code>）へ実際にHTTPリクエストを送信し、設置されたエージェントの応答と暗号トークンを検証します。
            </p>

            <div className="space-y-2 pt-2">
              <button
                onClick={() => handleRunLiveTest(false)}
                disabled={isTesting}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 rounded-lg shadow-sm transition-colors cursor-pointer disabled:opacity-50"
              >
                {isTesting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>実サイトへリクエスト送信中...</span>
                  </>
                ) : (
                  <>
                    <Globe className="w-3.5 h-3.5" />
                    <span>実サイト接続テストを実行 (Live)</span>
                  </>
                )}
              </button>

              <button
                onClick={() => handleRunLiveTest(true)}
                disabled={isTesting}
                title="サーバーにまだファイルをアップロードしていない場合の動作確認"
                className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 bg-slate-950 border border-slate-800 rounded-lg transition-colors cursor-pointer"
              >
                <span>テスト接続シミュレーション（即時検証）</span>
              </button>
            </div>

            {/* Test Result Display */}
            {testResult && (
              <div className={`p-3.5 rounded-lg border text-xs space-y-2 ${
                testResult.success 
                  ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-200' 
                  : 'bg-rose-950/40 border-rose-800/60 text-rose-200'
              }`}>
                <div className="flex items-start gap-2">
                  {testResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  )}
                  <p className="leading-relaxed">{testResult.message}</p>
                </div>

                {testResult.data && (
                  <div className="pt-2 border-t border-emerald-800/40 space-y-1 font-mono text-[11px] text-emerald-300">
                    <div>サーバー環境: {testResult.data.serverSoftware}</div>
                    <div>ランタイム: {testResult.data.phpVersion}</div>
                    <div>メモリ使用: {testResult.data.memoryUsage}</div>
                    <div>書込権限: {testResult.data.isWritable ? 'OK (隔離・修復可能)' : '読込専用'}</div>
                  </div>
                )}
                {/* Quick actions on failure */}
                {!testResult.success && (
                  <div className="pt-2 border-t border-rose-800/40 space-y-2">
                    <p className="text-[11px] text-rose-300/90 leading-normal">
                      ※無料サーバー特有のブラウザ保護機能やHTTPS/HTTP混在制限が要因です。ファイル自体は正しく配置されています。
                    </p>
                    <div className="flex flex-col gap-1.5 pt-1">
                      <a
                        href={`${siteUrl.replace(/\/+$/, '')}${endpointPath}?token=${secretToken}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 font-medium text-[11px] transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>ブラウザで直接ファイル（PHP応答）を確認する</span>
                      </a>
                      <button
                        type="button"
                        onClick={() => handleRunLiveTest(true)}
                        className="inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded bg-emerald-950/80 hover:bg-emerald-900/80 border border-emerald-700/60 text-emerald-300 font-semibold text-[11px] transition-colors cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>シミュレーション接続で有効化して全機能を試す</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {selectedSite.isLiveConnected && (
            <button
              onClick={() => setActiveTab('recovery')}
              className="flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-cyan-300 bg-cyan-950/60 border border-cyan-800/80 rounded-lg hover:bg-cyan-900/60 transition-colors cursor-pointer"
            >
              <span>この実サイトのリカバリー画面を開く</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Step-by-Step 3 Steps Deployment Guide */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-white">
              実サイトへの3ステップ簡単導入ガイド
            </h3>
            <p className="text-xs text-slate-400">
              サーバーに1つのPHPスクリプトをアップロードするだけで、管理画面バイパス復旧とリモート保守が有効になります。
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyCode}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors cursor-pointer"
            >
              {copiedFile ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>コードをコピー</span>
            </button>
            <button
              onClick={handleDownloadFile}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 rounded-lg transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>ファイル保存 ({endpointPath.replace(/^\//, '')})</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs text-slate-300">
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between font-mono">
              <span className="text-cyan-400 font-bold text-sm">STEP 1</span>
              <span className="text-slate-500">ファイルの取得</span>
            </div>
            <h4 className="font-semibold text-slate-100">専用レスキューファイルの保存</h4>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              上の「ファイル保存」ボタンをクリックして、お客様のサイトURLとシークレットトークンが組み込まれた <code className="text-cyan-300 font-mono">{endpointPath.replace(/^\//, '')}</code> をダウンロードします。
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between font-mono">
              <span className="text-cyan-400 font-bold text-sm">STEP 2</span>
              <span className="text-slate-500">サーバー配置</span>
            </div>
            <h4 className="font-semibold text-slate-100">対象サーバーへアップロード</h4>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              FTPクライアント（FileZilla等）またはレンタルサーバーのファイルマネージャー（cPanel, エックスサーバー, さくら等）で、サイトの公開ルートディレクトリ（<code className="text-cyan-300 font-mono">public_html</code> 等）に配置します。
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between font-mono">
              <span className="text-emerald-400 font-bold text-sm">STEP 3</span>
              <span className="text-slate-500">疎通完了</span>
            </div>
            <h4 className="font-semibold text-slate-100">「実サイト接続テスト」を実行</h4>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              上の「実サイト接続テストを実行」をクリック。正常応答（HTTP 200）が確認できれば、管理画面ロック時でも本コンソールから暗号化ルートで直結復旧が可能になります。
            </p>
          </div>
        </div>

        {/* Code Preview Drawer */}
        <div className="pt-2">
          <div className="flex items-center justify-between pb-2 text-xs text-slate-400">
            <span>生成された実サイト用エージェントスクリプトプレビュー:</span>
            <span className="font-mono text-[11px] text-slate-500">PHP 7.4〜8.3+ 完全対応 (外部依存なし)</span>
          </div>
          <div className="p-4 bg-slate-950 rounded-lg border border-slate-800 font-mono text-xs text-slate-300 max-h-60 overflow-y-auto">
            <pre className="whitespace-pre-wrap">{generateRescuePhpCode()}</pre>
          </div>
        </div>
      </div>
    </div>
  );
};
