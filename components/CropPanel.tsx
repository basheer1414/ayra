/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState } from 'react';

interface CropPanelProps {
  onSetAspect: (aspect: number | undefined) => void;
  disabled: boolean;
}

type AspectRatio = 'Free' | '1:1' | '16:9' | '4:3';

const CropPanel: React.FC<CropPanelProps> = ({ onSetAspect, disabled }) => {
  const [activeAspect, setActiveAspect] = useState<AspectRatio>('Free');
  
  const handleAspectChange = (aspect: AspectRatio, value: number | undefined) => {
    setActiveAspect(aspect);
    onSetAspect(value);
  }

  const aspects: { name: AspectRatio, value: number | undefined }[] = [
    { name: 'Free', value: undefined },
    { name: '1:1', value: 1 / 1 },
    { name: '16:9', value: 16 / 9 },
    { name: '4:3', value: 4 / 3 },
  ];

  return (
    <div className="w-full flex flex-col items-center gap-6">
      <div className="w-full text-left">
        <h3 className="text-lg font-semibold text-slate-100">Crop Image</h3>
        <p className="text-sm text-slate-400">Click and drag on the image to select a crop area.</p>
      </div>
      
      <div className="grid grid-cols-4 gap-3 w-full">
        {aspects.map(({ name, value }) => (
          <button
            key={name}
            onClick={() => handleAspectChange(name, value)}
            disabled={disabled}
            className={`px-2 py-1.5 rounded-md text-sm font-semibold transition-all duration-200 active:scale-95 disabled:opacity-50 ${
              activeAspect === name 
              ? 'bg-sky-600 text-white' 
              : 'bg-gray-700/80 hover:bg-gray-600/80 text-slate-200 hover:shadow-md hover:shadow-sky-500/30'
            }`}
          >
            {name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CropPanel;