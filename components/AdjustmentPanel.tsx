/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState } from 'react';

interface AdjustmentPanelProps {
  onApplyAdjustment: (prompt: string) => void;
  isLoading: boolean;
  disabled: boolean;
}

const AdjustmentPanel: React.FC<AdjustmentPanelProps> = ({ onApplyAdjustment, isLoading, disabled }) => {
  const [selectedPresetPrompt, setSelectedPresetPrompt] = useState<string | null>(null);
  const [customPrompt, setCustomPrompt] = useState('');

  const presets = [
    { name: 'Blur BG', prompt: 'Apply a realistic depth-of-field effect, making the background blurry while keeping the main subject in sharp focus.' },
    { name: 'Enhance', prompt: 'Slightly enhance the sharpness and details of the image without making it look unnatural.' },
    { name: 'Warmer', prompt: 'Adjust the color temperature to give the image warmer, golden-hour style lighting.' },
    { name: 'Studio', prompt: 'Add dramatic, professional studio lighting to the main subject.' },
  ];

  const activePrompt = selectedPresetPrompt || customPrompt;

  const handlePresetClick = (prompt: string) => {
    setSelectedPresetPrompt(prompt);
    setCustomPrompt('');
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomPrompt(e.target.value);
    setSelectedPresetPrompt(null);
  };

  const handleApply = () => {
    if (activePrompt) {
      onApplyAdjustment(activePrompt);
    }
  };

  return (
    <div className="w-full flex flex-col gap-4 md:gap-6">
      <h3 className="text-lg font-semibold text-slate-100">Adjustments</h3>
      
      <div className="grid grid-cols-2 gap-3">
        {presets.map(preset => (
          <button
            key={preset.name}
            onClick={() => handlePresetClick(preset.prompt)}
            disabled={isLoading || disabled}
            className={`w-full text-center backdrop-blur-md bg-white/5 border text-slate-200 font-semibold py-2 px-2 md:py-2.5 rounded-lg transition-all duration-200 ease-in-out hover:bg-white/10 hover:border-white/20 active:scale-95 text-xs md:text-sm disabled:opacity-50 disabled:cursor-not-allowed ${selectedPresetPrompt === preset.prompt ? 'border-sky-400/80 bg-sky-500/20 ring-2 ring-offset-2 ring-offset-gray-900 ring-sky-400' : 'border-white/10'}`}
          >
            {preset.name}
          </button>
        ))}
      </div>

      <input
        type="text"
        value={customPrompt}
        onChange={handleCustomChange}
        placeholder="Or describe an adjustment..."
        className="w-full bg-gray-800/80 border-2 border-gray-700/80 text-slate-200 rounded-lg p-2.5 text-xs md:text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 focus:outline-none transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50 focus:shadow-lg focus:shadow-sky-500/30"
        disabled={isLoading || disabled}
      />

      <button
          onClick={handleApply}
          className="w-full backdrop-blur-md bg-sky-600/20 border border-sky-500/50 text-sky-200 font-bold py-2 md:py-2.5 px-6 rounded-lg transition-all duration-300 ease-in-out hover:bg-sky-600/30 hover:border-sky-500/70 hover:shadow-[0_0_15px_theme(colors.sky.500/50)] active:scale-95 text-sm md:text-base disabled:bg-white/5 disabled:border-white/10 disabled:text-slate-500 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
          disabled={isLoading || disabled || !activePrompt?.trim()}
      >
          Apply Adjustment
      </button>
    </div>
  );
};

export default AdjustmentPanel;