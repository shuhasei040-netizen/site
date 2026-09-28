import React, { useState } from 'react';
import { useSecurity } from '../context/SecurityContext';
import { X, ShieldCheck, Globe, KeyRound } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const NewSiteModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { addNewSite } = useSecurity();
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [adminPath, setAdminPath] = useState('/wp-admin');
  const [cmsType, setCmsType] = useState<'WordPress' | 'Laravel' | 'Custom Next.js' | 'Drupal' | 'EC-CUBE'>('WordPress');
  const [environment, setEnvironment] = useState<'production' | 'staging' | 'internal'>('production');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !url) return;

    addNewSite({
      name,
      url,
      adminPath,
      cmsType,
      environment
    });

    setName('');
    setUrl('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-cyan-400" />
            <h3 className="text-base font-semibold text-white">新規対象サイトの登録</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-sm">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              サイト名称 / システム名
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例: ECダイレクト決済サイト 本番環境"
              required
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              対象サイト URL
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.company.co.jp"
              required
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                管理画面パス
              </label>
              <input
                type="text"
                value={adminPath}
                onChange={(e) => setAdminPath(e.target.value)}
                placeholder="/wp-admin or /admin"
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                CMS / 基盤アーキテクチャ
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
            <label className="block text-xs font-medium text-slate-300 mb-1">
              運用環境区分
            </label>
            <div className="flex gap-4 pt-1">
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="radio"
                  name="env"
                  value="production"
                  checked={environment === 'production'}
                  onChange={() => setEnvironment('production')}
                  className="text-cyan-500 focus:ring-cyan-500"
                />
                本番環境 (Production)
              </label>
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="radio"
                  name="env"
                  value="staging"
                  checked={environment === 'staging'}
                  onChange={() => setEnvironment('staging')}
                  className="text-cyan-500 focus:ring-cyan-500"
                />
                ステージング環境
              </label>
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="radio"
                  name="env"
                  value="internal"
                  checked={environment === 'internal'}
                  onChange={() => setEnvironment('internal')}
                  className="text-cyan-500 focus:ring-cyan-500"
                />
                社内検証環境
              </label>
            </div>
          </div>

          <div className="rounded-lg bg-slate-950/60 border border-slate-800 p-3 text-xs text-slate-400 space-y-1">
            <div className="flex items-center gap-1.5 text-cyan-400 font-medium">
              <KeyRound className="w-3.5 h-3.5" />
              <span>自動割り当て暗号化パラメータ</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              登録時に専用のEd25519公開鍵ペアおよび分離された暗号化ルート接続トークンが自動生成されます。後から「エージェント構成」タブで設定ファイルをエクスポートできます。
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white rounded-lg transition-colors cursor-pointer"
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              登録して監視開始
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
