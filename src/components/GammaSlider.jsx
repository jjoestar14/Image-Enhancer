import { useCallback } from 'react';

/**
 * Manual gamma slider for fine-tuning brightness.
 * Range: 0.1 (very bright) ↔ 3.0 (very dark)
 * Includes a reset button to return to auto-enhance value.
 */
export default function GammaSlider({ gamma, autoGamma, onChange, onReset, disabled }) {
  const handleChange = useCallback((e) => {
    onChange(parseFloat(e.target.value));
  }, [onChange]);

  // Calculate fill percentage for custom slider track
  const min = 0.1;
  const max = 3.0;
  const fillPercent = ((gamma - min) / (max - min)) * 100;

  const isAutoValue = Math.abs(gamma - autoGamma) < 0.01;

  return (
    <div className="gamma-slider" id="gamma-slider-section">
      <div className="gamma-slider__header">
        <label className="gamma-slider__label" htmlFor="gamma-range">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="5" />
            <line x1="12" y1="1" x2="12" y2="3" />
            <line x1="12" y1="21" x2="12" y2="23" />
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
            <line x1="1" y1="12" x2="3" y2="12" />
            <line x1="21" y1="12" x2="23" y2="12" />
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
          </svg>
          Kecerahan
        </label>
        <div className="gamma-slider__value-group">
          <span className="gamma-slider__value" id="gamma-value">
            γ {gamma.toFixed(2)}
          </span>
          {!isAutoValue && (
            <button
              className="gamma-slider__reset"
              onClick={onReset}
              disabled={disabled}
              id="reset-gamma-btn"
              title="Kembali ke Auto Enhance"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="1 4 1 10 7 10" />
                <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
              </svg>
              Reset
            </button>
          )}
        </div>
      </div>

      <div className="gamma-slider__track-wrapper">
        <span className="gamma-slider__track-label gamma-slider__track-label--left">Terang</span>
        <div className="gamma-slider__input-wrapper">
          <input
            type="range"
            id="gamma-range"
            min={min}
            max={max}
            step={0.05}
            value={gamma}
            onChange={handleChange}
            disabled={disabled}
            className="gamma-slider__input"
            style={{
              '--fill-percent': `${fillPercent}%`,
            }}
          />
        </div>
        <span className="gamma-slider__track-label gamma-slider__track-label--right">Gelap</span>
      </div>

      {isAutoValue && (
        <p className="gamma-slider__hint">
          ✨ Auto Enhance aktif — geser slider untuk penyesuaian manual
        </p>
      )}
    </div>
  );
}
