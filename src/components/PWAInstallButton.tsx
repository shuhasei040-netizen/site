import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Smartphone, X, CheckCircle, Apple, Shield } from 'lucide-react';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [installing, setInstalling] = useState(false);

  // If already running as an installed PWA standalone app
  if (isInstalled) {
    return (
      <div 
        className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono text-cyan-300 bg-cyan-950/60 border border-cyan-800/60 rounded-lg"
        title="このアプリは端末にPWAスタンドアロンアプリとしてインストール済みです"
      >
        <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
        <span className="text-[11px]">PWA稼働中</span>
      </div>
    );
  }

  // Chromium / Android / Desktop PWA flow
  if (isInstallable) {
    return (
      <button
        onClick={async () => {
          setInstalling(true);
          await install();
          setInstalling(false);
        }}
        disabled={installing}
        title="アプリを端末に直接インストール（独立ウィンドウ起動＆デバイス画面ロック制御が有効になります）"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 shadow-sm shadow-cyan-900/40 rounded-lg transition-all cursor-pointer whitespace-nowrap"
      >
        <Download className="w-3.5 h-3.5 animate-bounce" />
        <span>アプリをインストール</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          title="iPhone / iPad にアプリをインストール"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-900 border border-slate-700 hover:border-slate-600 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
        >
          <Apple className="w-3.5 h-3.5" />
          <span>iOSにインストール</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-700 p-6 shadow-2xl text-slate-100 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2 font-semibold text-base text-white">
                  <Shield className="w-5 h-5 text-cyan-400" />
                  <span>ホーム画面に追加 (iOS)</span>
                </div>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-4 space-y-3 text-xs leading-relaxed text-slate-300">
                <div className="flex items-start gap-2.5">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cyan-950 border border-cyan-800 text-[11px] font-bold text-cyan-400">
                    1
                  </span>
                  <p>Safari 画面下部（iPadは上部）の <strong>共有ボタン (四角から矢印)</strong> をタップします。</p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cyan-950 border border-cyan-800 text-[11px] font-bold text-cyan-400">
                    2
                  </span>
                  <p>メニューを下にスクロールし、<strong>「ホーム画面に追加」</strong> を選択します。</p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cyan-950 border border-cyan-800 text-[11px] font-bold text-cyan-400">
                    3
                  </span>
                  <p>右上の <strong>「追加」</strong> を押すと、独立したセキュリティアプリとしてインストールされます。</p>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-6 w-full rounded-lg bg-cyan-600 py-2 text-xs font-semibold text-white hover:bg-cyan-500 transition-colors"
              >
                閉じる
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // Fallback banner / helper button for desktop browser when beforeinstallprompt hasn't fired yet
  return (
    <button
      onClick={() => {
        alert('ブラウザのアドレスバー右側にある「インストール」アイコン（または設定メニュー > アプリをインストール）からインストールできます。');
      }}
      title="PWAアプリとして端末にインストール"
      className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-400 hover:text-cyan-300 bg-slate-900/60 border border-slate-800 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
    >
      <Download className="w-3.5 h-3.5 text-slate-400" />
      <span>PWA</span>
    </button>
  );
};
