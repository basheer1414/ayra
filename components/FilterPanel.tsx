/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState } from 'react';

interface FilterPanelProps {
  onApplyFilter: (prompt: string) => void;
  isLoading: boolean;
  disabled: boolean;
}

const FilterPanel: React.FC<FilterPanelProps> = ({ onApplyFilter, isLoading, disabled }) => {
  const [selectedPresetPrompt, setSelectedPresetPrompt] = useState<string | null>(null);
  const [customPrompt, setCustomPrompt] = useState('');

  const presets = [
    { name: 'Synthwave', prompt: 'Apply a vibrant 80s synthwave aesthetic with neon magenta and cyan glows, and subtle scan lines.' },
    { name: 'Anime', prompt: 'Give the image a vibrant Japanese anime style, with bold outlines, cel-shading, and saturated colors.' },
    { name: 'Lomo', prompt: 'Apply a Lomography-style cross-processing film effect with high-contrast, oversaturated colors, and dark vignetting.' },
    { name: 'Glitch', prompt: 'Transform the image into a futuristic holographic projection with digital glitch effects and chromatic aberration.' },
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
      onApplyFilter(activePrompt);
    }
  };

  return (
    <div className="w-full flex flex-col gap-6">
      <h3 className="text-lg font-semibold text-slate-100">Filters</h3>
      
      <div className="grid grid-cols-2 gap-3">
        {presets.map(preset => (
          <button
            key={preset.name}
            onClick={() => handlePresetClick(preset.prompt)}
            disabled={isLoading || disabled}
            className={`w-full text-center bg-gray-700/80 border border-transparent text-slate-200 font-semibold py-2.5 px-2 rounded-md transition-all duration-200 ease-in-out hover:bg-gray-600/80 active:scale-95 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-md hover:shadow-sky-500/30 ${selectedPresetPrompt === preset.prompt ? 'ring-2 ring-offset-2 ring-offset-gray-800 ring-sky-500' : ''}`}
          >
            {preset.name}
          </button>
        ))}
      </div>

      <input
        type="text"
        value={customPrompt}
        onChange={handleCustomChange}
        placeholder="Or describe a custom filter..."
        className="w-full bg-gray-800/80 border-2 border-gray-700/80 text-slate-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 focus:outline-none transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50 focus:shadow-lg focus:shadow-sky-500/30"
        disabled={isLoading || disabled}
      />
      
      <button
        onClick={handleApply}
        className="w-full bg-sky-600 text-white font-bold py-2.5 px-6 rounded-lg transition-all duration-300 ease-in-out hover:bg-sky-500 hover:shadow-[0_0_20px_theme(colors.sky.500)] active:scale-95 text-base disabled:bg-sky-800/80 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
        disabled={isLoading || disabled || !activePrompt?.trim()}
      >
        Apply Filter
      </button>

    </div>
  );
};

export default FilterPanel;