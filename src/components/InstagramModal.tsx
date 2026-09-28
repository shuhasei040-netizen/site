import React, { useState, useEffect } from 'react';
import { 
  X, 
  ExternalLink, 
  Search, 
  Send, 
  Compass, 
  QrCode, 
  Check, 
  Smartphone, 
  Globe, 
  ShieldCheck, 
  Sparkles,
  Bookmark
} from 'lucide-react';

interface InstagramModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstagramModal: React.FC<InstagramModalProps> = ({ isOpen, onClose }) => {
  const [username, setUsername] = useState<string>(() => {
    return localStorage.getItem('aegis_saved_instagram_handle') || '';
  });
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'quick' | 'profile' | 'mobile'>('quick');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const cleanHandle = username.replace(/^@/, '').trim();
  const profileUrl = cleanHandle ? `https://www.instagram.com/${cleanHandle}/` : 'https://www.instagram.com/';
  const appDeepLink = cleanHandle ? `instagram://user?username=${cleanHandle}` : 'instagram://app';

  const handleSaveDefault = () => {
    localStorage.setItem('aegis_saved_instagram_handle', cleanHandle);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const openUrl = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-2xl border border-pink-900/40 bg-slate-950 p-6 shadow-2xl shadow-pink-950/20 text-slate-100 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header with Instagram Gradient Accent */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex items-center justify-center shadow-lg shadow-pink-500/20">
              {/* Instagram Glyph */}
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-lg text-white flex items-center gap-2">
                Instagram ポータル＆アクセス
              </h3>
              <p className="text-xs text-slate-400">サイト内からInstagramへ安全・ワンタップアクセス</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Controls */}
        <div className="flex gap-2 my-4 p-1 bg-slate-900/80 rounded-xl border border-slate-800/80 text-xs font-medium">
          <button
            onClick={() => setActiveTab('quick')}
            className={`flex-1 py-1.5 px-3 rounded-lg transition-all cursor-pointer ${
              activeTab === 'quick' 
                ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white font-semibold shadow-sm' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            クイックアクセス
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 py-1.5 px-3 rounded-lg transition-all cursor-pointer ${
              activeTab === 'profile' 
                ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white font-semibold shadow-sm' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            アカウント指定
          </button>
          <button
            onClick={() => setActiveTab('mobile')}
            className={`flex-1 py-1.5 px-3 rounded-lg transition-all cursor-pointer ${
              activeTab === 'mobile' 
                ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white font-semibold shadow-sm' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            スマホ連携 / QR
          </button>
        </div>

        {/* Tab 1: Quick Access */}
        {activeTab === 'quick' && (
          <div className="space-y-3.5">
            {/* In-App Sentinel Full View Switcher Button */}
            <button
              onClick={() => {
                onClose();
                window.dispatchEvent(new CustomEvent('open_instagram_tab'));
              }}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-pink-950/60 to-purple-950/60 border border-pink-700/60 hover:border-pink-500 text-white font-semibold transition-all group cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-pink-500/20 text-pink-400 group-hover:scale-110 transition-transform">
                  <Globe className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                    AEGIS SENTINEL 画面内ブラウザで開く
                    <Sparkles className="w-3 h-3 text-amber-400" />
                  </div>
                  <div className="text-[10px] text-slate-400 font-normal">アプリのメイン作業エリアに内蔵ブラウザを展開</div>
                </div>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-pink-600 text-white">開く</span>
            </button>

            {/* Direct Open Master Button */}
            <button
              onClick={() => openUrl('https://www.instagram.com/')}
              className="w-full flex items-center justify-between p-3.5 rounded-xl bg-gradient-to-r from-purple-900/40 via-pink-900/40 to-amber-900/30 border border-pink-700/50 hover:border-pink-500 text-white font-semibold shadow-md transition-all group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-pink-500/20 text-pink-400 group-hover:scale-110 transition-transform">
                  <Globe className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <div className="text-sm font-semibold flex items-center gap-1.5">
                    Instagram Webを開く
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  </div>
                  <div className="text-[11px] text-slate-400 font-normal">公式サイト（ログイン・タイムライン）へ直接遷移</div>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-pink-300 group-hover:translate-x-0.5 transition-transform" />
            </button>

            {/* Quick Action Grid */}
            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => openUrl('https://www.instagram.com/direct/inbox/')}
                className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-pink-600/50 text-left transition-all group cursor-pointer"
              >
                <div className="p-1.5 rounded-lg bg-purple-950 text-purple-400">
                  <Send className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-white group-hover:text-pink-300">ダイレクト (DM)</div>
                  <div className="text-[10px] text-slate-400">メッセージ送受信</div>
                </div>
              </button>

              <button
                onClick={() => openUrl('https://www.instagram.com/explore/')}
                className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-pink-600/50 text-left transition-all group cursor-pointer"
              >
                <div className="p-1.5 rounded-lg bg-pink-950 text-pink-400">
                  <Compass className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-white group-hover:text-pink-300">発見・検索 (Explore)</div>
                  <div className="text-[10px] text-slate-400">トレンド・検索</div>
                </div>
              </button>
            </div>

            {/* Current Target Site Official SNS Link (if saved) */}
            {cleanHandle && (
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Bookmark className="w-4 h-4 text-cyan-400" />
                  <div>
                    <span className="text-xs text-slate-400">保存済みアカウント: </span>
                    <span className="text-xs font-mono font-semibold text-cyan-300">@{cleanHandle}</span>
                  </div>
                </div>
                <button
                  onClick={() => openUrl(profileUrl)}
                  className="px-2.5 py-1 text-xs font-medium text-cyan-400 bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-800/60 rounded-lg transition-colors cursor-pointer"
                >
                  開く
                </button>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Specific Profile / Handle */}
        {activeTab === 'profile' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                開きたい Instagram アカウント名 / ユーザー名:
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 font-mono text-sm">
                  @
                </span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="ユーザー名 (例: official_brand)"
                  className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 text-sm text-white placeholder-slate-500 font-mono"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                ※URLではなくユーザー名（アカウントのID）を入力してください
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => openUrl(profileUrl)}
                disabled={!cleanHandle}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 disabled:opacity-50 text-white text-xs font-semibold shadow-md transition-all cursor-pointer"
              >
                <span>@{cleanHandle || 'アカウント'} のページを開く</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={handleSaveDefault}
                disabled={!cleanHandle}
                title="このサイトの公式Instagramアカウントとして固定保存"
                className="px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white text-xs font-medium transition-colors cursor-pointer"
              >
                {savedSuccess ? (
                  <Check className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Bookmark className="w-4 h-4" />
                )}
              </button>
            </div>

            {savedSuccess && (
              <p className="text-xs text-emerald-400 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                アカウントをサイト連携デフォルトとして保存しました
              </p>
            )}
          </div>
        )}

        {/* Tab 3: Mobile App & QR Code */}
        {activeTab === 'mobile' && (
          <div className="space-y-4 text-center">
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col items-center">
              <div className="p-3 bg-white rounded-xl mb-3 shadow-lg">
                {/* Dynamically generated QR code via Google Charts / QuickChart for Instagram URL */}
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(profileUrl)}`}
                  alt="Instagram QR Code"
                  className="w-32 h-32 block"
                />
              </div>
              <p className="text-xs font-medium text-slate-200">スマホのカメラでスキャン</p>
              <p className="text-[11px] text-slate-400 mt-0.5">端末のInstagram公式アプリが直接起動します</p>
            </div>

            <button
              onClick={() => {
                window.location.href = appDeepLink;
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-pink-500 text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              <Smartphone className="w-4 h-4 text-pink-400" />
              <span>端末のInstagramアプリを直接起動 (App DeepLink)</span>
            </button>
          </div>
        )}

        {/* Footer Note */}
        <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
          <span>Aegis Secure External Link</span>
          <button 
            onClick={onClose} 
            className="hover:text-slate-300 transition-colors cursor-pointer"
          >
            閉じる
          </button>
        </div>

      </div>
    </div>
  );
};
