import React, { useState } from 'react';
import { ShieldAlert, Lock, Unlock, KeyRound, AlertTriangle } from 'lucide-react';

interface AppLockScreenProps {
  onUnlock: (pin: string) => boolean;
}

export const AppLockScreen: React.FC<AppLockScreenProps> = ({ onUnlock }) => {
  const [pin, setPin] = useState<string>('');
  const [error, setError] = useState<boolean>(false);

  const handleKeyPress = (num: string) => {
    if (pin.length < 8) {
      const nextPin = pin + num;
      setPin(nextPin);
      setError(false);
    }
  };

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1));
    setError(false);
  };

  const handleClear = () => {
    setPin('');
    setError(false);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const success = onUnlock(pin);
    if (!success) {
      setError(true);
      setPin('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/98 backdrop-blur-xl p-4">
      <div className="w-full max-w-sm rounded-3xl border border-rose-900/40 bg-slate-900/90 p-8 shadow-2xl shadow-rose-950/40 text-center animate-in fade-in zoom-in-95 duration-200">
        
        {/* Lock Shield Icon */}
        <div className="mx-auto w-16 h-16 rounded-2xl bg-rose-950 border border-rose-700/60 flex items-center justify-center text-rose-400 mb-4 shadow-lg shadow-rose-900/30">
          <Lock className="w-8 h-8 animate-pulse" />
        </div>

        <h2 className="text-xl font-bold text-white tracking-tight">
          Aegis Sentinel ロック中
        </h2>
        <p className="text-xs text-slate-400 mt-1.5">
          端末およびサーバー操作権限の保護のためロックされています。PINを入力して解除してください。
        </p>

        {/* PIN Indicators */}
        <div className="flex justify-center items-center gap-3 my-6">
          {[0, 1, 2, 3].map((idx) => (
            <div
              key={idx}
              className={`w-3.5 h-3.5 rounded-full transition-all duration-150 ${
                pin.length > idx 
                  ? 'bg-rose-500 scale-110 shadow-sm shadow-rose-500/50' 
                  : 'bg-slate-800 border border-slate-700'
              } ${error ? 'bg-red-600 animate-shake' : ''}`}
            />
          ))}
        </div>

        {error && (
          <p className="text-xs font-semibold text-rose-400 mb-4 flex items-center justify-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" />
            PINコードが正しくありません (デフォルト: 1234)
          </p>
        )}

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-2.5 max-w-[260px] mx-auto mb-6">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              type="button"
              onClick={() => handleKeyPress(digit)}
              className="h-12 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-lg font-semibold text-white transition-colors active:scale-95 cursor-pointer"
            >
              {digit}
            </button>
          ))}
          <button
            type="button"
            onClick={handleClear}
            className="h-12 rounded-xl bg-slate-900 text-xs font-medium text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            クリア
          </button>
          <button
            type="button"
            onClick={() => handleKeyPress('0')}
            className="h-12 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-lg font-semibold text-white transition-colors active:scale-95 cursor-pointer"
          >
            0
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="h-12 rounded-xl bg-slate-900 text-xs font-medium text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            削除
          </button>
        </div>

        <button
          onClick={() => handleSubmit()}
          disabled={pin.length < 4}
          className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 disabled:opacity-40 text-white font-semibold text-sm shadow-lg shadow-rose-950/50 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Unlock className="w-4 h-4" />
          <span>ロック解除</span>
        </button>

        <p className="text-[10px] text-slate-500 mt-4">
          ※初期PINは「1234」です
        </p>

      </div>
    </div>
  );
};
