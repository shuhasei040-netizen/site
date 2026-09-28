import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  ExternalLink, 
  RefreshCw, 
  ArrowLeft, 
  ArrowRight, 
  Lock, 
  Smartphone, 
  Monitor, 
  Search, 
  Compass, 
  Send, 
  User, 
  Sparkles, 
  AlertCircle,
  Copy,
  Check,
  Film,
  Bookmark,
  Layers
} from 'lucide-react';

export const InstagramView: React.FC = () => {
  const [currentUrl, setCurrentUrl] = useState<string>(() => {
    return localStorage.getItem('aegis_last_instagram_url') || 'https://www.instagram.com/';
  });
  const [urlInput, setUrlInput] = useState<string>(currentUrl);
  const [viewMode, setViewMode] = useState<'mobile' | 'desktop'>('mobile');
  const [iframeKey, setIframeKey] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);
  const [iframeErrorNotice, setIframeErrorNotice] = useState<boolean>(false);
  const [savedHandle, setSavedHandle] = useState<string>(() => {
    return localStorage.getItem('aegis_saved_instagram_handle') || '';
  });

  useEffect(() => {
    localStorage.setItem('aegis_last_instagram_url', currentUrl);
    setUrlInput(currentUrl);
  }, [currentUrl]);

  const handleNavigate = (url: string) => {
    let target = url.trim();
    if (target.startsWith('@')) {
      target = `https://www.instagram.com/${target.replace(/^@/, '')}/`;
    } else if (!target.startsWith('http://') && !target.startsWith('https://')) {
      target = `https://www.instagram.com/${target}`;
    }
    setCurrentUrl(target);
    setUrlInput(target);
    setIframeKey(k => k + 1);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReload = () => {
    setIframeKey(k => k + 1);
  };

  // Open standalone smartphone-sized popup window (real app experience on Chromebook/desktop)
  const openStandaloneWindow = (url: string = currentUrl) => {
    const width = 450;
    const height = 820;
    const left = window.screen.width ? (window.screen.width - width) / 2 : 100;
    const top = window.screen.height ? (window.screen.height - height) / 2 : 50;
    window.open(
      url,
      'aegis_instagram_standalone',
      `width=${width},height=${height},top=${top},left=${left},status=no,menubar=no,toolbar=no,location=yes,resizable=yes,scrollbars=yes`
    );
  };

  const openExternalTab = (url: string = currentUrl) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      {/* Top Banner / In-App Browser Header */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 shadow-xl backdrop-blur-md">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          
          {/* Logo & Title */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex items-center justify-center shadow-lg shadow-pink-500/20 shrink-0">
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">
                  Instagram アプリ内ブラウザ (AEGIS SENTINEL In-App Browser)
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-pink-950 text-pink-300 border border-pink-800">
                  LIVE WORKSPACE
                </span>
              </div>
              <p className="text-xs text-slate-400">
                AEGIS ROUTE SENTINEL の画面内で、Instagram の本物のサイトをリアルタイムに操作・閲覧
              </p>
            </div>
          </div>

          {/* Quick Shortcuts */}
          <div className="flex items-center gap-1.5 flex-wrap w-full md:w-auto justify-end">
            <button
              onClick={() => handleNavigate('https://www.instagram.com/')}
              className="px-2.5 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span>ホーム</span>
            </button>
            <button
              onClick={() => handleNavigate('https://www.instagram.com/explore/')}
              className="px-2.5 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Compass className="w-3.5 h-3.5 text-pink-400" />
              <span>発見</span>
            </button>
            <button
              onClick={() => handleNavigate('https://www.instagram.com/reels/')}
              className="px-2.5 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Film className="w-3.5 h-3.5 text-purple-400" />
              <span>リール</span>
            </button>
            <button
              onClick={() => handleNavigate('https://www.instagram.com/direct/inbox/')}
              className="px-2.5 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5 text-blue-400" />
              <span>DM</span>
            </button>
            
            {savedHandle && (
              <button
                onClick={() => handleNavigate(`https://www.instagram.com/${savedHandle}/`)}
                className="px-2.5 py-1.5 text-xs font-medium rounded-lg bg-cyan-950/80 border border-cyan-800/80 text-cyan-300 hover:bg-cyan-900/80 transition-colors flex items-center gap-1 cursor-pointer"
                title={`保存済みアカウント @${savedHandle} を開く`}
              >
                <User className="w-3.5 h-3.5 text-cyan-400" />
                <span>@{savedHandle}</span>
              </button>
            )}

            {/* Standalone Window Button */}
            <button
              onClick={() => openStandaloneWindow(currentUrl)}
              title="独立したスマホサイズウィンドウ（別画面）で本物のInstagramを開きます"
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white shadow-sm flex items-center gap-1.5 cursor-pointer whitespace-nowrap ml-1"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>独立アプリ画面で開く</span>
            </button>
          </div>

        </div>

        {/* Real Browser Address Bar & Chrome */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row items-center gap-2">
          
          {/* Nav Controls */}
          <div className="flex items-center gap-1 shrink-0 self-start sm:self-auto">
            <button
              onClick={() => window.history.back()}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              title="戻る"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => window.history.forward()}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              title="進む"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={handleReload}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              title="リロード"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {/* URL Input Bar */}
          <div className="relative flex-1 w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-emerald-400">
              <Lock className="w-3.5 h-3.5" />
            </div>
            <form onSubmit={(e) => { e.preventDefault(); handleNavigate(urlInput); }}>
              <input
                type="text"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://www.instagram.com/ または @ユーザー名"
                className="w-full pl-9 pr-20 py-2 bg-slate-950 border border-slate-700 focus:border-pink-500 rounded-xl text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-pink-500"
              />
            </form>
            <div className="absolute inset-y-0 right-0 pr-1.5 flex items-center gap-1">
              <button
                type="button"
                onClick={handleCopy}
                className="p-1 text-slate-400 hover:text-white rounded"
                title="URLをコピー"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
              <button
                type="button"
                onClick={() => handleNavigate(urlInput)}
                className="px-2 py-1 text-[11px] font-semibold text-white bg-pink-600 hover:bg-pink-500 rounded-lg cursor-pointer"
              >
                移動
              </button>
            </div>
          </div>

          {/* Frame Mode Switches */}
          <div className="flex items-center gap-1 self-end sm:self-auto shrink-0">
            <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex items-center gap-1">
              <button
                onClick={() => setViewMode('mobile')}
                className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1 cursor-pointer transition-colors ${
                  viewMode === 'mobile' ? 'bg-pink-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
                title="スマートフォン画面サイズ"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">スマホ</span>
              </button>
              <button
                onClick={() => setViewMode('desktop')}
                className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1 cursor-pointer transition-colors ${
                  viewMode === 'desktop' ? 'bg-pink-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
                title="全幅デスクトップサイズ"
              >
                <Monitor className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">全幅</span>
              </button>
            </div>

            <button
              onClick={() => openExternalTab(currentUrl)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              title="新しいブラウザタブで開く"
            >
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>

      {/* Real In-App Webview Area */}
      <div className="w-full flex justify-center">
        {viewMode === 'mobile' ? (
          /* Sleek Mobile Phone Frame */
          <div className="w-full max-w-[430px] rounded-[38px] border-[6px] border-slate-800 bg-slate-950 shadow-2xl shadow-black/80 overflow-hidden relative flex flex-col h-[780px]">
            {/* Phone Top Notch / Dynamic Island */}
            <div className="h-6 bg-slate-900 flex items-center justify-between px-6 text-[10px] text-slate-400 font-mono select-none border-b border-slate-800/80">
              <span>9:41</span>
              <div className="w-16 h-3 bg-black rounded-full" />
              <span>5G 100%</span>
            </div>

            {/* In-App Browser Frame */}
            <div className="flex-1 w-full bg-white relative">
              <iframe
                key={iframeKey}
                src={currentUrl}
                title="Instagram Real Site Webview"
                className="w-full h-full border-0"
                allow="camera; microphone; clipboard-write; encrypted-media; picture-in-picture; web-share"
                sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-modals"
              />

              {/* Policy Overlay Guide (Shown below or transparently available if Meta blocks iframe embedding) */}
              <div className="absolute bottom-2 left-2 right-2 p-3 rounded-2xl bg-slate-950/95 border border-pink-900/60 shadow-xl backdrop-blur-md text-slate-200 text-xs">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 font-semibold text-white">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>Instagram 直接操作モード</span>
                  </div>
                  <button
                    onClick={() => openStandaloneWindow(currentUrl)}
                    className="text-[11px] font-semibold text-pink-400 hover:text-pink-300 underline"
                  >
                    独立ウィンドウで開く ↗
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                  Instagram のセキュリティ規約によりフレーム内表示が保護されている場合でも、上の「独立アプリ画面で開く」を押すと、AEGIS SENTINEL 連携の完全な操作ウィンドウが即座に起動します。
                </p>
                <div className="mt-2 flex gap-2">
                  <button
                    onClick={() => openStandaloneWindow(currentUrl)}
                    className="flex-1 py-1.5 px-2.5 rounded-lg bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-semibold text-[11px] text-center cursor-pointer"
                  >
                    今すぐ本物のインスタを開く
                  </button>
                  <button
                    onClick={() => openExternalTab(currentUrl)}
                    className="py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] cursor-pointer"
                  >
                    新タブ
                  </button>
                </div>
              </div>
            </div>

            {/* Phone Home Bar */}
            <div className="h-4 bg-slate-900 flex items-center justify-center border-t border-slate-800/80">
              <div className="w-28 h-1 bg-slate-600 rounded-full" />
            </div>
          </div>
        ) : (
          /* Desktop Responsive Webview */
          <div className="w-full rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden shadow-2xl h-[780px] flex flex-col relative">
            <div className="flex-1 w-full bg-white relative">
              <iframe
                key={iframeKey}
                src={currentUrl}
                title="Instagram Desktop Webview"
                className="w-full h-full border-0"
                allow="camera; microphone; clipboard-write; encrypted-media; picture-in-picture; web-share"
                sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-modals"
              />

              {/* Desktop Direct Launcher Bar */}
              <div className="absolute bottom-3 left-4 right-4 p-3 rounded-xl bg-slate-950/95 border border-pink-900/60 shadow-xl backdrop-blur-md text-slate-200 text-xs flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex items-center justify-center text-white shrink-0">
                    <Globe className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-semibold text-white">Instagram Live Webview: </span>
                    <span className="font-mono text-slate-400">{currentUrl}</span>
                    <p className="text-[11px] text-slate-400">ログイン・投稿・DM・ストーリーズをAEGIS SENTINEL内で完全サポート</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openStandaloneWindow(currentUrl)}
                    className="py-2 px-3 rounded-lg bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-semibold text-xs transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>独立ウィンドウで開く</span>
                  </button>
                  <button
                    onClick={() => openExternalTab(currentUrl)}
                    className="py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>別タブ</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
