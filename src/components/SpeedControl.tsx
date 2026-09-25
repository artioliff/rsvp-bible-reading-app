import React from 'react';
import { SPEED_OPTIONS, Speed, Theme } from '../types';
import { Gauge } from 'lucide-react';

interface SpeedControlProps {
  speed: number;
  onSpeedChange: (speed: number) => void;
  theme: Theme;
}

const SpeedControl: React.FC<SpeedControlProps> = ({ speed, onSpeedChange, theme }) => {
  const isDark = theme === 'dark';
  const speedIndex = SPEED_OPTIONS.indexOf(speed as Speed);
  const sliderValue = speedIndex >= 0 ? speedIndex : 2;

  const handleSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
    const idx = parseInt(e.target.value);
    onSpeedChange(SPEED_OPTIONS[idx]);
  };

  return (
    <div className="w-full px-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Gauge size={16} className={isDark ? 'text-amber-400' : 'text-amber-600'} />
          <span className={`text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
            Velocidade
          </span>
        </div>
        <div
          className={`px-3 py-1 rounded-full text-sm font-bold ${
            isDark ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-100 text-amber-700'
          }`}
        >
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
          style={{
            background: `linear-gradient(to right, ${isDark ? '#f59e0b' : '#f59e0b'} 0%, ${isDark ? '#f59e0b' : '#f59e0b'} ${(sliderValue / (SPEED_OPTIONS.length - 1)) * 100}%, ${isDark ? '#334155' : '#e2e8f0'} ${(sliderValue / (SPEED_OPTIONS.length - 1)) * 100}%, ${isDark ? '#334155' : '#e2e8f0'} 100%)`,
          }}
        />
      </div>

      {/* Speed labels */}
      <div className="flex justify-between mt-1">
        {SPEED_OPTIONS.map((s, i) => (
          <button
            key={s}
            onClick={() => onSpeedChange(s)}
            className={`text-xs transition-all ${
              speed === s
                ? isDark
                  ? 'text-amber-400 font-bold'
                  : 'text-amber-600 font-bold'
                : isDark
                ? 'text-slate-500 hover:text-slate-300'
                : 'text-slate-400 hover:text-slate-600'
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
