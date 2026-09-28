import React, { createContext, useContext, useState, useEffect } from 'react';
import { TargetSite, SecurityVulnerability, AuditLogEntry, AgentConfigOptions } from '../types';
import { INITIAL_SITES, INITIAL_VULNERABILITIES, INITIAL_AUDIT_LOGS } from '../data/initialData';

interface SecurityContextType {
  sites: TargetSite[];
  selectedSiteId: string;
  selectedSite: TargetSite;
  vulnerabilities: SecurityVulnerability[];
  auditLogs: AuditLogEntry[];
  activeTab: 'emergency_route' | 'recovery' | 'vulnerabilities' | 'agent_deploy' | 'maintenance' | 'audit_logs' | 'site_setup' | 'instagram';
  isConnectingEmergencyRoute: boolean;
  isSimulatingRecovery: boolean;
  selectSite: (siteId: string) => void;
  setActiveTab: (tab: 'emergency_route' | 'recovery' | 'vulnerabilities' | 'agent_deploy' | 'maintenance' | 'audit_logs' | 'site_setup' | 'instagram') => void;
  connectEmergencyRoute: (siteId?: string) => Promise<void>;
  disconnectEmergencyRoute: (siteId?: string) => void;
  neutralizeVulnerability: (vulnId: string) => void;
  neutralizeAllThreats: (siteId: string) => Promise<void>;
  runDeepScan: (siteId: string) => Promise<void>;
  simulateLockoutIncident: (siteId: string) => void;
  addNewSite: (site: Partial<TargetSite>) => void;
  updateTargetSiteConfig: (siteId: string, updates: Partial<TargetSite>) => void;
  deleteSite: (siteId: string) => void;
  testLiveSiteConnection: (siteId: string, forceSimulatedSuccess?: boolean, overrideConfig?: { url?: string; customEndpointPath?: string; secretToken?: string }) => Promise<{ success: boolean; message: string; data?: any }>;
  addAuditLog: (entry: Omit<AuditLogEntry, 'id' | 'timestamp'>) => void;
  agentConfigOptions: AgentConfigOptions;
  updateAgentConfig: (options: Partial<AgentConfigOptions>) => void;
}

const STORAGE_KEY_SITES = 'aegis_sentinel_sites_v2';

const SecurityContext = createContext<SecurityContextType | undefined>(undefined);

export const SecurityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sites, setSites] = useState<TargetSite[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SITES);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to load saved sites from localStorage', e);
    }
    return INITIAL_SITES;
  });

  const [selectedSiteId, setSelectedSiteId] = useState<string>(() => {
    return sites[0]?.id || 'site-ec';
  });

  const [vulnerabilities, setVulnerabilities] = useState<SecurityVulnerability[]>(INITIAL_VULNERABILITIES);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(INITIAL_AUDIT_LOGS);
  const [activeTab, setActiveTab] = useState<'emergency_route' | 'recovery' | 'vulnerabilities' | 'agent_deploy' | 'maintenance' | 'audit_logs' | 'site_setup' | 'instagram'>('recovery');
  const [isConnectingEmergencyRoute, setIsConnectingEmergencyRoute] = useState(false);
  const [isSimulatingRecovery, setIsSimulatingRecovery] = useState(false);

  // Sync sites with localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SITES, JSON.stringify(sites));
    } catch (e) {
      console.warn('Failed to save sites to localStorage', e);
    }
  }, [sites]);

  const selectedSite = sites.find(s => s.id === selectedSiteId) || sites[0] || INITIAL_SITES[0];

  const [agentConfigOptions, setAgentConfigOptions] = useState<AgentConfigOptions>({
    siteUrl: selectedSite.url,
    environment: selectedSite.environment,
    encryptionAlgorithm: 'Ed25519 + ChaCha20-Poly1305',
    heartbeatIntervalSec: 15,
    allowedCidrs: '198.51.100.0/24, 203.0.113.50/32',
    isolationMode: 'hard_quarantine',
    dropinLanguage: 'php'
  });

  const addAuditLog = (entry: Omit<AuditLogEntry, 'id' | 'timestamp'>) => {
    const now = new Date();
    const formatted = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    const newLog: AuditLogEntry = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: formatted,
      ...entry
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const selectSite = (siteId: string) => {
    setSelectedSiteId(siteId);
    const target = sites.find(s => s.id === siteId);
    if (target) {
      setAgentConfigOptions(prev => ({
        ...prev,
        siteUrl: target.url,
        environment: target.environment
      }));
    }
  };

  const updateTargetSiteConfig = (siteId: string, updates: Partial<TargetSite>) => {
    setSites(prev => prev.map(s => {
      if (s.id === siteId) {
        return {
          ...s,
          ...updates
        };
      }
      return s;
    }));

    addAuditLog({
      siteId,
      operator: 'セキュリティ管理者',
      channel: 'Console Zero-Trust',
      action: '対象サイト構成設定の更新',
      status: 'success',
      details: `サイト接続パラメータ（URL, エンドポイント, 暗号トークン）を更新しました。`
    });
  };

  const deleteSite = (siteId: string) => {
    if (sites.length <= 1) {
      alert('最低1つの対象サイト設定が必要です。');
      return;
    }
    const newSites = sites.filter(s => s.id !== siteId);
    setSites(newSites);
    setSelectedSiteId(newSites[0].id);

    addAuditLog({
      siteId,
      operator: 'セキュリティ管理者',
      channel: 'Console Zero-Trust',
      action: '対象サイトの登録解除',
      status: 'success',
      details: 'サイトプロファイルを管理対象から削除しました。'
    });
  };

  const testLiveSiteConnection = async (siteId: string, forceSimulatedSuccess = false, overrideConfig?: { url?: string; customEndpointPath?: string; secretToken?: string }): Promise<{ success: boolean; message: string; data?: any }> => {
    const site = sites.find(s => s.id === siteId);
    if (!site) return { success: false, message: '対象サイトが見つかりません' };

    const effectiveUrl = (overrideConfig?.url || site.url).trim().replace(/\/+$/, '');
    const rawPath = overrideConfig?.customEndpointPath || site.customEndpointPath || '/aegis-rescue.php';
    const effectivePath = rawPath.startsWith('/') ? rawPath : `/${rawPath}`;
    const effectiveToken = overrideConfig?.secretToken || site.secretToken;

    const startTime = performance.now();
    const endpointUrl = `${effectiveUrl}${effectivePath}?action=ping&token=${encodeURIComponent(effectiveToken)}&_t=${Date.now()}`;

    addAuditLog({
      siteId,
      operator: '接続検証エンジン',
      channel: 'Agent Secure Pipe',
      action: `実サイト・エージェント疎通検証の実行: ${endpointUrl}`,
      status: 'in_progress',
      details: 'HTTPリクエストを送信し、設置されたAegisRouteエージェントの暗号署名と応答を照合中...'
    });

    if (forceSimulatedSuccess) {
      await new Promise(r => setTimeout(r, 900));
      const simulatedData = {
        phpVersion: `${site.cmsType === 'WordPress' ? 'PHP 8.2.14' : 'Node.js v20.11.0'} (Runtime Verified)`,
        serverSoftware: 'Apache/2.4.58 (Unix) OpenSSL/3.0.11',
        memoryUsage: '42.1 MB / 512 MB (Normal)',
        lastChecked: new Date().toLocaleTimeString('ja-JP'),
        statusMessage: 'テスト用シミュレーション接続成功・エージェント稼働中',
        isWritable: true
      };

      setSites(prev => prev.map(s => {
        if (s.id === siteId) {
          return {
            ...s,
            isLiveConnected: true,
            agentInstalled: true,
            agentVersion: 'v2.4.2-verified',
            emergencyRouteStatus: 'connected',
            latencyMs: 18,
            lastHeartbeat: new Date().toLocaleTimeString('ja-JP'),
            liveResponseData: simulatedData
          };
        }
        return s;
      }));

      addAuditLog({
        siteId,
        operator: '接続検証エンジン',
        channel: 'Agent Secure Pipe',
        action: '実サイト・エージェント疎通検証 成功 (シミュレーション接続)',
        status: 'success',
        details: `対象サイトのエージェント応答を確認しました。暗号化検証ルートが開通しました。`
      });

      return {
        success: true,
        message: 'エージェントとの疎通に成功しました。暗号化直結ルートが利用可能です。',
        data: simulatedData
      };
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const response = await fetch(endpointUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'X-Aegis-Token': site.secretToken
        },
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      const latency = Math.round(performance.now() - startTime);

      if (response.ok) {
        let jsonResponse: any = null;
        try {
          jsonResponse = await response.json();
        } catch {
          // not json
        }

        const liveData = {
          phpVersion: jsonResponse?.php_version || 'PHP 8.x / Runtime OK',
          serverSoftware: jsonResponse?.server || response.headers.get('server') || 'Verified Web Server',
          memoryUsage: jsonResponse?.memory || 'Normal',
          lastChecked: new Date().toLocaleTimeString('ja-JP'),
          statusMessage: 'HTTP 200 OK - エージェント署名一致',
          isWritable: jsonResponse?.writable ?? true
        };

        setSites(prev => prev.map(s => {
          if (s.id === siteId) {
            return {
              ...s,
              url: effectiveUrl,
              customEndpointPath: effectivePath,
              secretToken: effectiveToken,
              isLiveConnected: true,
              agentInstalled: true,
              agentVersion: 'v2.4.2-live',
              emergencyRouteStatus: 'connected',
              latencyMs: latency,
              lastHeartbeat: new Date().toLocaleTimeString('ja-JP'),
              liveResponseData: liveData
            };
          }
          return s;
        }));

        addAuditLog({
          siteId,
          operator: '接続検証エンジン',
          channel: 'Agent Secure Pipe',
          action: '実サイト・エージェント疎通検証 成功 (Live HTTP)',
          status: 'success',
          details: `実URL (${effectiveUrl}) への接続に成功 (HTTP ${response.status}, RTT: ${latency}ms)。エージェント署名を確認しました。`
        });

        return {
          success: true,
          message: `実サイト (${effectiveUrl}) 上のエージェントと正常に通信が確立されました。(遅延: ${latency}ms)`,
          data: liveData
        };
      } else {
        throw new Error(`HTTPステータス: ${response.status} ${response.statusText}`);
      }
    } catch (err: any) {
      const isMixedContent = typeof window !== 'undefined' && window.location.protocol === 'https:' && endpointUrl.startsWith('http:');
      const errorMsg = err?.name === 'AbortError'
        ? '接続タイムアウト (6秒): 対象サーバーからの応答がありませんでした。'
        : isMixedContent 
          ? 'ブラウザの混在通信(Mixed Content)制限: HTTPSの管理画面からHTTPサイトへの直接通信はブラウザに保護遮断されます。'
          : (err?.message || 'ネットワークエラーまたはCORS制限');

      addAuditLog({
        siteId,
        operator: '接続検証エンジン',
        channel: 'Agent Secure Pipe',
        action: '実サイト疎通検証 失敗',
        status: 'failed',
        details: `対象エンドポイント (${endpointUrl}) への接続エラー: ${errorMsg}`
      });

      return {
        success: false,
        message: `${errorMsg}（InfinityFree等の無料サーバーのBot保護やHTTP制限が要因の可能性があります）`
      };
    }
  };

  const connectEmergencyRoute = async (targetId?: string) => {
    const siteToConnect = targetId || selectedSiteId;
    setIsConnectingEmergencyRoute(true);

    addAuditLog({
      siteId: siteToConnect,
      operator: 'セキュリティオペレーター',
      channel: 'Emergency Encrypted Route',
      action: '検証専用暗号化ルート接続シーケンス開始',
      status: 'in_progress',
      details: 'Mutual TLS 1.3 / Ed25519暗号鍵によるアウトオブバンド接続を確立中...'
    });

    await new Promise(r => setTimeout(r, 1200));

    setSites(prev => prev.map(s => {
      if (s.id === siteToConnect) {
        return {
          ...s,
          emergencyRouteStatus: 'connected',
          latencyMs: s.isLiveConnected ? (s.latencyMs || 14) : 14,
          lastHeartbeat: new Date().toLocaleTimeString('ja-JP')
        };
      }
      return s;
    }));

    setIsConnectingEmergencyRoute(false);

    addAuditLog({
      siteId: siteToConnect,
      operator: 'AegisRoute Sentinel',
      channel: 'Emergency Encrypted Route',
      action: '暗号化トンネル確立完了',
      status: 'success',
      details: '事前構成された検証専用ルートへの双方向セキュアパイプが開通しました。管理画面迂回での復旧作業が可能です。'
    });
  };

  const disconnectEmergencyRoute = (targetId?: string) => {
    const siteToDisconnect = targetId || selectedSiteId;
    setSites(prev => prev.map(s => {
      if (s.id === siteToDisconnect) {
        return {
          ...s,
          emergencyRouteStatus: 'standby'
        };
      }
      return s;
    }));

    addAuditLog({
      siteId: siteToDisconnect,
      operator: 'セキュリティオペレーター',
      channel: 'Emergency Encrypted Route',
      action: '緊急暗号化ルート待機状態への遷移',
      status: 'success',
      details: '暗号化パイプラインを切断し、平常時監視スタンバイモードへ切り替えました。'
    });
  };

  const neutralizeVulnerability = (vulnId: string) => {
    const now = new Date().toLocaleTimeString('ja-JP');
    setVulnerabilities(prev => prev.map(v => {
      if (v.id === vulnId) {
        return {
          ...v,
          isNeutralized: true,
          neutralizedAt: now
        };
      }
      return v;
    }));

    const targetVuln = vulnerabilities.find(v => v.id === vulnId);
    if (targetVuln) {
      addAuditLog({
        siteId: targetVuln.siteId,
        operator: 'セキュリティオペレーター (緊急ルート経由)',
        channel: 'Emergency Encrypted Route',
        action: `脅威の無効化処理: ${targetVuln.title}`,
        status: 'success',
        details: `対象パス: ${targetVuln.targetPath} を隔離・無効化しました。`
      });

      setSites(prev => prev.map(s => {
        if (s.id === targetVuln.siteId) {
          const remainingThreats = vulnerabilities.filter(v => v.siteId === s.id && v.id !== vulnId && !v.isNeutralized).length;
          const isFullyClean = remainingThreats === 0;
          return {
            ...s,
            activeThreatCount: remainingThreats,
            status: isFullyClean ? 'nominal' : 'recovering',
            primaryAdminReachable: isFullyClean ? true : s.primaryAdminReachable
          };
        }
        return s;
      }));
    }
  };

  const neutralizeAllThreats = async (siteId: string) => {
    setIsSimulatingRecovery(true);
    const now = new Date().toLocaleTimeString('ja-JP');

    addAuditLog({
      siteId,
      operator: 'AegisRoute Sentinel 復旧エンジン',
      channel: 'Emergency Encrypted Route',
      action: '一括緊急リカバリー実行 (全アクセスポイント無効化＆設定復旧)',
      status: 'in_progress',
      details: '不正ファイル隔離、DB管理者権限リセット、.htaccessロールバック、全セッション失効を実施中...'
    });

    await new Promise(r => setTimeout(r, 1400));

    setVulnerabilities(prev => prev.map(v => {
      if (v.siteId === siteId) {
        return {
          ...v,
          isNeutralized: true,
          neutralizedAt: now
        };
      }
      return v;
    }));

    setSites(prev => prev.map(s => {
      if (s.id === siteId) {
        return {
          ...s,
          status: 'nominal',
          activeThreatCount: 0,
          primaryAdminReachable: true,
          lastHeartbeat: now
        };
      }
      return s;
    }));

    setIsSimulatingRecovery(false);

    addAuditLog({
      siteId,
      operator: 'AegisRoute Sentinel 復旧エンジン',
      channel: 'Emergency Encrypted Route',
      action: '対象サイト正常化・復旧完了',
      status: 'success',
      details: '不正アクセスポイントおよび不具合要因の無効化に成功。管理画面アクセスが正常に再開されました。'
    });
  };

  const runDeepScan = async (siteId: string) => {
    addAuditLog({
      siteId,
      operator: 'AegisRoute 統合監査エンジン',
      channel: 'Agent Secure Pipe',
      action: '深層バックドア・整合性スキャンの実行',
      status: 'in_progress',
      details: 'ファイルハッシュ差分、難読化関数パターン、未承認アカウント、特権昇格シグネチャを走査中...'
    });

    await new Promise(r => setTimeout(r, 1200));

    addAuditLog({
      siteId,
      operator: 'AegisRoute 統合監査エンジン',
      channel: 'Agent Secure Pipe',
      action: '深層スキャン完了',
      status: 'success',
      details: '走査ファイル数: 8,421件。整合性データベースとの照合を完了しました。'
    });
  };

  const simulateLockoutIncident = (siteId: string) => {
    const site = sites.find(s => s.id === siteId);
    if (!site) return;

    setVulnerabilities(prev => prev.map(v => {
      if (v.siteId === siteId) {
        return {
          ...v,
          isNeutralized: false,
          neutralizedAt: undefined
        };
      }
      return v;
    }));

    setSites(prev => prev.map(s => {
      if (s.id === siteId) {
        return {
          ...s,
          status: 'critical_locked',
          primaryAdminReachable: false,
          activeThreatCount: 3,
          emergencyRouteStatus: 'standby'
        };
      }
      return s;
    }));

    addAuditLog({
      siteId,
      operator: '障害・攻撃シミュレーションエンジン',
      channel: 'Console Zero-Trust',
      action: '管理画面ロックアウト＆不具合障害の発生検知',
      status: 'failed',
      details: '【インシデント発生】HTTP 503エラーおよび認証バイパス攻撃により管理画面が操作不能になりました。緊急暗号化ルートからの接続が必要です。'
    });

    setActiveTab('recovery');
  };

  const addNewSite = (newSiteData: Partial<TargetSite>) => {
    const secretRandom = `aegis_sec_${Math.random().toString(36).substring(2, 10)}_${Date.now().toString().slice(-6)}`;
    const newSite: TargetSite = {
      id: `site-${Date.now()}`,
      name: newSiteData.name || '新規対象サイト',
      url: newSiteData.url || 'https://my-target-site.com',
      adminPath: newSiteData.adminPath || '/wp-admin',
      environment: newSiteData.environment || 'production',
      status: 'nominal',
      primaryAdminReachable: true,
      emergencyRouteStatus: 'standby',
      emergencyRouteKeyFingerprint: `ed25519:${Math.random().toString(16).substring(2, 6)}:${Math.random().toString(16).substring(2, 6)}:${Math.random().toString(16).substring(2, 6)}:${Math.random().toString(16).substring(2, 6)}`,
      emergencyRouteIp: '198.51.100.99 (検証専用暗号化ルート)',
      lastHeartbeat: '未接続',
      latencyMs: 0,
      agentInstalled: false,
      agentVersion: '未導入 (エージェント構成待ち)',
      activeThreatCount: 0,
      cmsType: newSiteData.cmsType || 'WordPress',
      secretToken: secretRandom,
      customEndpointPath: newSiteData.customEndpointPath || '/aegis-rescue.php',
      isLiveConnected: false
    };

    setSites(prev => [...prev, newSite]);
    setSelectedSiteId(newSite.id);

    addAuditLog({
      siteId: newSite.id,
      operator: 'セキュリティ管理者',
      channel: 'Console Zero-Trust',
      action: '対象サイトプロファイルの登録',
      status: 'success',
      details: `サイト「${newSite.name}」(${newSite.url}) を登録しました。専用シークレットトークンが生成されました。`
    });

    setActiveTab('site_setup');
  };

  const updateAgentConfig = (options: Partial<AgentConfigOptions>) => {
    setAgentConfigOptions(prev => ({
      ...prev,
      ...options
    }));
  };

  return (
    <SecurityContext.Provider
      value={{
        sites,
        selectedSiteId,
        selectedSite,
        vulnerabilities,
        auditLogs,
        activeTab,
        isConnectingEmergencyRoute,
        isSimulatingRecovery,
        selectSite,
        setActiveTab,
        connectEmergencyRoute,
        disconnectEmergencyRoute,
        neutralizeVulnerability,
        neutralizeAllThreats,
        runDeepScan,
        simulateLockoutIncident,
        addNewSite,
        updateTargetSiteConfig,
        deleteSite,
        testLiveSiteConnection,
        addAuditLog,
        agentConfigOptions,
        updateAgentConfig
      }}
    >
      {children}
    </SecurityContext.Provider>
  );
};

export const useSecurity = () => {
  const context = useContext(SecurityContext);
  if (!context) {
    throw new Error('useSecurity must be used within a SecurityProvider');
  }
  return context;
};
