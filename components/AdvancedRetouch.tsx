/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect } from 'react';
import { ChevronDownIcon } from './icons';

interface AdvancedRetouchProps {
    onPromptChange: (prompt: string) => void;
    disabled: boolean;
}

interface AccordionItemProps {
  title: string;
  children: React.ReactNode;
}

const AccordionItem: React.FC<AccordionItemProps> = ({ title, children }) => (
  <details className="group border border-white/10 rounded-2xl overflow-hidden">
    <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/5 transition-colors duration-250">
      <span className="font-semibold">{title}</span>
      <ChevronDownIcon className="w-5 h-5 transition-transform duration-250 group-open:rotate-180" />
    </summary>
    <div className="bg-black/20 p-4 border-t border-white/10">
      {children}
    </div>
  </details>
);

const clothingStyles = ['hoodie', 'jacket', 'dress', 'suit', 't-shirt'];
const colors = [
    { name: 'Red', hex: '#ef4444' }, { name: 'Blue', hex: '#3b82f6' },
    { name: 'Green', hex: '#22c55e' }, { name: 'Yellow', hex: '#eab308' },
    { name: 'Black', hex: '#000000' }, { name: 'White', hex: '#ffffff' }
];

const AdvancedRetouch: React.FC<AdvancedRetouchProps> = ({ onPromptChange, disabled }) => {
    const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
    const [selectedColor, setSelectedColor] = useState<{name: string, hex: string} | null>(null);

    useEffect(() => {
        if (selectedStyle && selectedColor) {
            onPromptChange(`replace outfit with a ${selectedColor.name.toLowerCase()} ${selectedStyle}`);
        } else if (selectedStyle) {
            onPromptChange(`replace outfit with a ${selectedStyle}`);
        } else {
            onPromptChange('');
        }
    }, [selectedStyle, selectedColor, onPromptChange]);

    return (
      <div className="space-y-3 animate-fade-in">
        <AccordionItem title="Wardrobe">
            <div className='space-y-4'>
                <div>
                    <h4 className="text-sm font-semibold text-slate-400 mb-2">Style</h4>
                    <div className="flex flex-wrap gap-2">
                        {clothingStyles.map(style => (
                            <button key={style} onClick={() => setSelectedStyle(style)} disabled={disabled}
                                className={`capitalize px-3 py-1.5 text-xs font-bold rounded-lg border transition-all duration-200 ${selectedStyle === style ? 'bg-sky-500 text-white border-sky-500' : 'bg-gray-700 hover:bg-gray-600 border-gray-600'}`}>
                                {style}
                            </button>
                        ))}
                    </div>
                </div>
                <div>
                    <h4 className="text-sm font-semibold text-slate-400 mb-2">Color</h4>
                    <div className="flex flex-wrap gap-3">
                        {colors.map(color => (
                            <button key={color.name} onClick={() => setSelectedColor(color)} disabled={disabled}
                                className={`w-7 h-7 rounded-full border-2 transition-transform duration-200 active:scale-90 ${selectedColor?.name === color.name ? 'border-white ring-2 ring-offset-2 ring-offset-gray-800 ring-sky-400' : 'border-gray-600 hover:border-white'}`}
                                style={{ backgroundColor: color.hex }}
                                aria-label={`Select ${color.name} color`}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </AccordionItem>
        <AccordionItem title="Pose">
            <p className="text-sm text-slate-400">Pose controls coming soon.</p>
        </AccordionItem>
        <AccordionItem title="Background">
            <p className="text-sm text-slate-400">Background options coming soon.</p>
        </AccordionItem>
        <AccordionItem title="Lighting">
            <p className="text-sm text-slate-400">Lighting presets coming soon.</p>
        </AccordionItem>
        <AccordionItem title="Cleanup">
            <p className="text-sm text-slate-400">Cleanup tools coming soon.</p>
        </AccordionItem>
      </div>
    );
};
  
export default AdvancedRetouch;