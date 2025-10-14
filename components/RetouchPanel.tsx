/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect, useMemo } from 'react';
import GenerateButton from './GenerateButton';
import SimpleRetouch from './SimpleRetouch';
import AdvancedRetouch from './AdvancedRetouch';

interface RetouchPanelProps {
  onPromptChange: (prompt: string) => void;
  onGenerate: () => void;
  prompt: string;
  isLoading: boolean;
  disabled: boolean;
  hasImage: boolean;
}

const FACE_PROTECTION_PROMPT = "do not touch face and don't change face elements and features";

const RetouchPanel: React.FC<RetouchPanelProps> = ({ 
  onPromptChange, 
  onGenerate, 
  prompt,
  isLoading, 
  disabled,
  hasImage,
}) => {
  const [isFaceProtected, setIsFaceProtected] = useState(true);
  const [activeTab, setActiveTab] = useState<'simple' | 'advanced'>('simple');
  const [simpleBadges, setSimpleBadges] = useState<string[]>([]);
  const [advancedPrompt, setAdvancedPrompt] = useState('');
  const [userTypedPrompt, setUserTypedPrompt] = useState('');

  // This effect constructs the final prompt for the backend
  useEffect(() => {
    let parts: string[] = [];
    if (activeTab === 'simple') {
      parts = [...simpleBadges];
    } else {
      parts = advancedPrompt ? [advancedPrompt] : [];
    }
    
    if (userTypedPrompt) {
        parts.push(userTypedPrompt);
    }

    let combinedPrompt = parts.join(', ');

    if (isFaceProtected) {
      combinedPrompt = combinedPrompt 
        ? `${FACE_PROTECTION_PROMPT}. ${combinedPrompt}` 
        : FACE_PROTECTION_PROMPT;
    }
    onPromptChange(combinedPrompt);
  }, [isFaceProtected, simpleBadges, advancedPrompt, userTypedPrompt, activeTab, onPromptChange]);

  const promptPlaceholder = useMemo(() => {
    if (!hasImage) return "Upload an image first";
    return "e.g., 'change my shirt color to blue'";
  }, [hasImage]);
  
  const handleBadgeToggle = (badgeText: string) => {
    setSimpleBadges(prev => 
      prev.includes(badgeText)
        ? prev.filter(b => b !== badgeText)
        : [...prev, badgeText]
    );
  };

  return (
    <div className="flex flex-col h-full text-slate-200">
      {/* Face Protection Checkbox */}
      <label className="flex items-center gap-2 mb-2 cursor-pointer group p-2 -ml-2 rounded-2xl hover:bg-white/5 transition-colors duration-250">
        <input 
          type="checkbox"
          checked={isFaceProtected}
          onChange={(e) => setIsFaceProtected(e.target.checked)}
          disabled={disabled}
          className="w-4 h-4 bg-gray-700 border-gray-600 rounded text-sky-500 focus:ring-sky-500/50 focus:ring-2 focus:ring-offset-0 disabled:opacity-50"
        />
        <span className="font-semibold text-xs text-slate-300 group-hover:text-white transition-colors duration-250">Face protection</span>
      </label>

      {/* Tab Switcher */}
      <div className="flex p-0.5 mb-3 bg-gray-900/50 backdrop-blur-md rounded-xl border border-white/10">
        <button 
          onClick={() => setActiveTab('simple')}
          disabled={disabled}
          className={`flex-1 py-1 rounded-lg text-xs font-bold transition-all duration-300 ${activeTab === 'simple' ? 'bg-sky-600 text-white shadow-sm shadow-sky-500/30' : 'text-slate-300 hover:bg-white/10'}`}
        >
          Simple
        </button>
        <button 
          onClick={() => setActiveTab('advanced')}
          disabled={disabled}
          className={`flex-1 py-1 rounded-lg text-xs font-bold transition-all duration-300 ${activeTab === 'advanced' ? 'bg-sky-600 text-white shadow-sm shadow-sky-500/30' : 'text-slate-300 hover:bg-white/10'}`}
        >
          Advanced
        </button>
      </div>
      
      {/* Tab Content */}
      <div className="flex-grow min-h-0 overflow-y-auto pr-2 -mr-2">
        {activeTab === 'simple' ? (
          <SimpleRetouch selectedBadges={simpleBadges} onBadgeToggle={handleBadgeToggle} disabled={disabled} />
        ) : (
          <AdvancedRetouch onPromptChange={setAdvancedPrompt} disabled={disabled}/>
        )}
      </div>

      {/* Prompt Input & Generate Button */}
      <div className="mt-auto pt-2 flex flex-col gap-2">
          <div className="relative w-full flex flex-col min-h-[5rem] bg-black/20 text-slate-200 rounded-2xl p-2 border border-white/10 focus-within:ring-2 focus-within:ring-sky-500/80 focus-within:border-sky-500/80 transition-all duration-250 backdrop-blur-md">
              {isFaceProtected && (
                  <div className="flex-shrink-0 pb-1.5">
                    <span className="flex items-center gap-1.5 bg-gray-900/80 text-sky-300 text-xs font-semibold px-2.5 py-1 rounded-full border border-sky-500/20 w-fit">
                        <svg className="w-3 h-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 1a4.5 4.5 0 0 0-4.5 4.5V9H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-.5V5.5A4.5 4.5 0 0 0 10 1Zm3 8V5.5a3 3 0 1 0-6 0V9h6Z" clipRule="evenodd" /></svg>
                        Face Protected
                    </span>
                  </div>
              )}
              <textarea
                  value={userTypedPrompt}
                  onChange={(e) => setUserTypedPrompt(e.target.value)}
                  placeholder={promptPlaceholder}
                  className="w-full flex-grow bg-transparent border-0 text-slate-200 p-0 placeholder-gray-500 focus:ring-0 focus:outline-none resize-none text-sm"
                  disabled={isLoading || disabled}
              />
          </div>
          <form onSubmit={(e) => { e.preventDefault(); onGenerate(); }} className="w-full">
            <GenerateButton
                disabled={isLoading || disabled || !prompt.trim()}
                loading={isLoading}
            />
          </form>
      </div>
    </div>
  );
};

export default RetouchPanel;