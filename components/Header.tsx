/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import type { Tab } from '../types';
import { UploadIcon, DownloadIcon, LibraryIcon, RetouchIcon, AdjustIcon, AutoEnhanceIcon, RemoveBgIcon } from './icons';

const SparkleIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846-.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.898 20.624l-.219.874-.219-.874a1.5 1.5 0 00-1.023-1.023l-.874-.219.874-.219a1.5 1.5 0 001.023-1.023l.219-.874.219.874a1.5 1.5 0 001.023 1.023l.874.219-.874.219a1.5 1.5 0 00-1.023 1.023z" />
  </svg>
);

interface HeaderProps {
    activeTab: Tab;
    onTabChange: (tab: Tab) => void;
    imageLoaded: boolean;
    onUploadNew: () => void;
    onDownload: () => void;
    onAutoEnhance: () => void;
    onRemoveBackground: () => void;
    isLoading: boolean;
}

const Header: React.FC<HeaderProps> = ({ activeTab, onTabChange, imageLoaded, onUploadNew, onDownload, onAutoEnhance, onRemoveBackground, isLoading }) => {
    const tabs = [
      { name: 'library' as Tab, label: 'Library', icon: <LibraryIcon className="w-5 h-5" /> },
      { name: 'retouch' as Tab, label: 'Retouch', icon: <RetouchIcon className="w-5 h-5" /> },
      { name: 'adjust' as Tab, label: 'Adjust', icon: <AdjustIcon className="w-5 h-5" /> },
    ];

    const baseButtonClasses = "flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all duration-300 backdrop-blur-sm disabled:opacity-40 disabled:cursor-not-allowed text-sm font-medium";
    const inactiveToolButtonClasses = "bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 hover:border-white/20 hover:text-white";
    const activeTabButtonClasses = "bg-sky-500/20 border border-sky-400/50 text-sky-300 font-semibold shadow-[0_0_15px_theme(colors.sky.500/40)]";
    const inactiveTabButtonClasses = "bg-transparent text-slate-300 hover:bg-white/10";
  
    return (
      <header className="w-full h-[65px] flex items-center justify-between py-3 px-6 border-b border-gray-700/60 bg-[#1E1E1E]/80 backdrop-blur-lg sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <SparkleIcon className="w-6 h-6 text-sky-400" />
          <h1 className="font-logo text-2xl tracking-wider text-slate-100">
              AYRA
          </h1>
        </div>

        {/* --- Desktop Tools --- */}
        <div className="hidden md:flex items-center gap-2 absolute left-1/2 -translate-x-1/2">
            <div className="flex items-center gap-1">
              {tabs.map(tab => (
                  <button
                    key={tab.name}
                    onClick={() => onTabChange(tab.name)}
                    disabled={tab.name !== 'library' && !imageLoaded}
                    className={`${baseButtonClasses} ${activeTab === tab.name ? activeTabButtonClasses : inactiveTabButtonClasses}`}
                >
                    {tab.icon}
                    <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {imageLoaded && (
              <>
                <div className="h-6 w-px bg-white/10 mx-1"></div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={onAutoEnhance}
                        disabled={isLoading || !imageLoaded}
                        className={`${baseButtonClasses} ${inactiveToolButtonClasses}`}
                        title="Auto Enhance"
                    >
                        <AutoEnhanceIcon className="w-5 h-5" />
                        <span>Enhance</span>
                    </button>
                    <button
                        onClick={onRemoveBackground}
                        disabled={isLoading || !imageLoaded}
                        className={`${baseButtonClasses} ${inactiveToolButtonClasses}`}
                        title="Remove Background"
                    >
                        <RemoveBgIcon className="w-5 h-5" />
                        <span>Remove BG</span>
                    </button>
                </div>
              </>
            )}
        </div>
        
        {imageLoaded && (
          <div className="flex items-center gap-3">
            <button 
                title="Upload New"
                onClick={onUploadNew}
                className="bg-gray-700/80 border border-gray-600/80 text-slate-200 p-2.5 rounded-full transition-all duration-300 hover:bg-gray-600/80 active:scale-95 hover:shadow-lg hover:shadow-sky-500/40"
            >
                <UploadIcon className="w-5 h-5" />
            </button>
             <button 
              title="Download"
              onClick={onDownload}
              disabled={!imageLoaded}
              className="bg-sky-600 text-white p-2.5 rounded-full transition-all duration-300 ease-in-out hover:bg-sky-500 active:scale-95 disabled:bg-sky-800/80 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-sky-400/60"
          >
              <DownloadIcon className="w-5 h-5" />
          </button>
          </div>
        )}
      </header>
    );
  };
  
  export default Header;