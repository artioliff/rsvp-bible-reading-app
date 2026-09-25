import React from 'react';
import type { Speed } from '../../types';
import { SPEED_OPTIONS } from '../../constants/settings';
import { Gauge } from 'lucide-react';

interface SpeedControlProps {
  speed: number;
  onSpeedChange: (speed: number) => void;
}

const SpeedControl: React.FC<SpeedControlProps> = ({ speed, onSpeedChange }) => {
  const speedIndex = SPEED_OPTIONS.indexOf(speed as Speed);
  const sliderValue = speedIndex >= 0 ? speedIndex : 2;

  const handleSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
    const idx = parseInt(e.target.value);
    onSpeedChange(SPEED_OPTIONS[idx]);
  };

  // Preenchimento vem de --progress; cores (fill/track) vivem em src/index.css
  const pct = (sliderValue / (SPEED_OPTIONS.length - 1)) * 100;

  return (
    <div className="w-full px-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Gauge size={16} className="text-ink" />
          <span className="text-xs font-semibold text-ink">
            Velocidade
          </span>
        </div>
        <div className="px-3 py-1 rounded-full text-sm font-bold bg-surface-hover text-ink">
          {speed} ppm
        </div>
      </div>

      {/* Slider */}
      <div className="relative">
        <input
          type="range"
          min={0}
          max={SPEED_OPTIONS.length - 1}
          step={1}
          value={sliderValue}
          onChange={handleSlider}
          className="w-full h-2 rounded-full appearance-none cursor-pointer speed-slider"
          style={{ '--progress': `${pct}%` } as React.CSSProperties}
        />
      </div>

      {/* Speed labels */}
      <div className="flex justify-between mt-1">
        {SPEED_OPTIONS.map((s, i) => (
          <button
            key={s}
            onClick={() => onSpeedChange(s)}
            className={`text-xs transition-all ${
              speed === s ? 'text-ink font-bold' : 'text-ink-subtle hover:text-ink-hover'
            } ${i === 0 || i === SPEED_OPTIONS.length - 1 ? '' : 'hidden sm:block'}`}
          >
            {s >= 1000 ? '1k' : s}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SpeedControl;
