import React, { useState } from 'react';
import { 
  X, 
  Lock, 
  Unlock, 
  Sun, 
  Moon, 
  ShieldCheck, 
  AlertCircle, 
  Smartphone, 
  Key, 
  Eye, 
  EyeOff,
  Check,
  Zap
} from 'lucide-react';
import { DeviceLockConfig } from '../hooks/useDeviceLock';

interface DeviceLockModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: DeviceLockConfig;
  updateConfig: (newCfg: Partial<DeviceLockConfig>) => void;
  isWakeLockActive: boolean;
  wakeLockSupported: boolean;
  toggleWakeLock: () => Promise<void>;
  lockAppNow: () => void;
}

export const DeviceLockModal: React.FC<DeviceLockModalProps> = ({
  isOpen,
  onClose,
  config,
  updateConfig,
  isWakeLockActive,
  wakeLockSupported,
  toggleWakeLock,
  lockAppNow,
}) => {
  const [newPin, setNewPin] = useState<string>(config.pinCode);
  const [showPin, setShowPin] = useState<boolean>(false);
  const [pinSaved, setPinSaved] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSavePin = () => {
    if (newPin.length >= 4) {
      updateConfig({ pinCode: newPin, appLockEnabled: true });
      setPinSaved(true);
      setTimeout(() => setPinSaved(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-2xl border border-cyan-800/50 bg-slate-950 p-6 shadow-2xl shadow-cyan-950/30 text-slate-100 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-700/60 flex items-center justify-center text-cyan-400">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-white flex items-center gap-2">
                デバイス・画面ロック制御センター
              </h3>
              <p className="text-xs text-slate-400">PWAによる端末スリープ制御＆アプリ緊急PINロック</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-5 space-y-6">

          {/* Section 1: Screen Wake Lock (端末画面の自動ロック・スリープ制御) */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className={`p-2 rounded-lg ${isWakeLockActive ? 'bg-amber-950 text-amber-400' : 'bg-slate-800 text-slate-400'}`}>
                  {isWakeLockActive ? <Sun className="w-5 h-5 animate-pulse" /> : <Moon className="w-5 h-5" />}
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                    端末画面の自動ロック・スリープ制御
                    {isWakeLockActive ? (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                        スリープ防止中
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                        通常端末設定
                      </span>
                    )}
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    監視中にPCやスマートフォンの画面が勝手に暗くなってロックされるのを防ぎます
                  </p>
                </div>
              </div>

              {/* Toggle Switch */}
              <button
                onClick={toggleWakeLock}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  config.wakeLockEnabled ? 'bg-cyan-600' : 'bg-slate-800'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    config.wakeLockEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="mt-3 text-[11px] font-mono text-slate-400 flex items-center gap-2 pt-2 border-t border-slate-800/60">
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              <span>
                API状態: {wakeLockSupported ? (isWakeLockActive ? 'Screen Wake Lock 取得中 (画面常時点灯)' : '待機中 (OS制御)') : 'ブラウザ未対応'}
              </span>
            </div>
          </div>

          {/* Section 2: App Master Security Lock (アプリ緊急PINロック) */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className={`p-2 rounded-lg ${config.appLockEnabled ? 'bg-rose-950 text-rose-400' : 'bg-slate-800 text-slate-400'}`}>
                  {config.appLockEnabled ? <Lock className="w-5 h-5" /> : <Unlock className="w-5 h-5" />}
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">
                    アプリ緊急セキュリティPINロック
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    サーバー操作権限を不正利用から守るため、PINで画面を即時ロック
                  </p>
                </div>
              </div>

              {/* Toggle Lock Feature */}
              <button
                onClick={() => updateConfig({ appLockEnabled: !config.appLockEnabled })}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  config.appLockEnabled ? 'bg-rose-600' : 'bg-slate-800'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    config.appLockEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {config.appLockEnabled && (
              <div className="pt-3 border-t border-slate-800/80 space-y-3 animate-in fade-in duration-150">
                {/* PIN Code Setting */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    解除用PINコード (4桁以上):
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <input
                        type={showPin ? 'text' : 'password'}
                        value={newPin}
                        maxLength={8}
                        onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm font-mono tracking-widest text-center text-white"
                        placeholder="1234"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPin(!showPin)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300"
                      >
                        {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <button
                      onClick={handleSavePin}
                      className="px-3 py-2 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      {pinSaved ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Key className="w-3.5 h-3.5" />}
                      <span>保存</span>
                    </button>
                  </div>
                </div>

                {/* Sub Options */}
                <div className="space-y-2 pt-1 text-xs">
                  <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.autoLockOnBlur}
                      onChange={(e) => updateConfig({ autoLockOnBlur: e.target.checked })}
                      className="rounded bg-slate-950 border-slate-700 text-rose-600 focus:ring-0"
                    />
                    <span>アプリを最小化または他画面に切り替えた時に自動ロックする</span>
                  </label>
                </div>

                {/* Instant Lock Trigger */}
                <button
                  onClick={() => {
                    onClose();
                    lockAppNow();
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-rose-700 to-red-600 hover:from-rose-600 hover:to-red-500 text-white text-xs font-semibold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
                >
                  <Lock className="w-4 h-4" />
                  <span>今すぐアプリ画面をロックする</span>
                </button>
              </div>
            )}
          </div>

        </div>

        {/* Modal Footer */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <span>PWA Hardware & Security Layer</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-medium transition-colors cursor-pointer"
          >
            完了
          </button>
        </div>

      </div>
    </div>
  );
};
