/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';

interface SimpleRetouchProps {
  selectedBadges: string[];
  onBadgeToggle: (badgeText: string) => void;
  disabled: boolean;
}

const badges = [
  'Change pose', 'Change clothes', 'Change hairstyle', 
  'Use specs', 'Use cap', 'Change background', 
  'Change weather', 'Clean blemishes', 
  'Add makeup', 'Blur background', 'Expand scene'
];

const SimpleRetouch: React.FC<SimpleRetouchProps> = ({ selectedBadges, onBadgeToggle, disabled }) => {
  return (
    <div className="flex flex-wrap gap-1.5 animate-fade-in">
      {badges.map(badge => {
        const isSelected = selectedBadges.includes(badge);
        return (
          <button
            key={badge}
            onClick={() => onBadgeToggle(badge)}
            disabled={disabled}
            className={`text-center font-semibold py-0.5 px-2.5 rounded-full transition-all duration-250 ease-in-out active:scale-95 text-xs disabled:opacity-50 disabled:cursor-not-allowed border
              ${isSelected 
                ? 'bg-sky-500 text-white border-sky-500/50 shadow-sm shadow-sky-500/30' 
                : 'bg-black/20 border-white/10 text-slate-300 hover:bg-white/10 hover:border-white/20 hover:text-white'
              }`}
          >
            {badge}
          </button>
        );
      })}
    </div>
  );
};

export default SimpleRetouch;