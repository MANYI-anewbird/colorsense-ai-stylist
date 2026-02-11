import React from 'react';

export interface DevTuningPanelState {
  maxSide: number;
  deltaEBase: number;
  deltaESmallBoost: number;
  deltaELargeTighten: number;
  maxRegionPixels: number;
  sampleCount: number;
  lowLightPercentile: number;
  highLightPercentile: number;
  patternThreshold: number;
  debugOverlay: boolean;
}

interface DevTuningPanelProps {
  state: DevTuningPanelState;
  onStateChange: (state: DevTuningPanelState) => void;
  onReset: () => void;
}

export function DevTuningPanel({
  state,
  onStateChange,
  onReset,
}: DevTuningPanelProps) {
  const handleOptionChange = React.useCallback(
    (partial: Partial<DevTuningPanelState>) => {
      onStateChange({ ...state, ...partial });
    },
    [state, onStateChange]
  );

  const onSliderChange = (
    key: keyof DevTuningPanelState,
    value: number,
    transform?: (n: number) => number
  ) => {
    const nextValue = transform ? transform(value) : value;
    handleOptionChange({ [key]: nextValue } as Partial<DevTuningPanelState>);
  };

  const lowPercent = Math.round(state.lowLightPercentile * 100);
  const highPercent = Math.round(state.highLightPercentile * 100);

  return (
    <aside className="fixed top-24 right-4 z-50 w-80 rounded-xl border border-border bg-background/95 p-4 shadow-lg backdrop-blur-md">
      <div className="flex items-center justify-between pb-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide">
          Dominant Color Dev Tuning
        </h2>
        <button
          type="button"
          className="text-xs text-muted-foreground hover:text-foreground"
          onClick={onReset}
        >
          Reset
        </button>
      </div>
      <div className="max-h-[65vh] space-y-4 overflow-y-auto pr-1 text-sm">
        <Field
          label={`Max Side (${state.maxSide}px)`}
          description="Downsample dimension"
        >
          <select
            value={state.maxSide}
            onChange={(e) =>
              handleOptionChange({ maxSide: Number(e.target.value) })
            }
            className="w-full rounded border border-input bg-background px-2 py-1"
          >
            <option value={512}>512 px</option>
            <option value={640}>640 px</option>
          </select>
        </Field>

        <SliderField
          label={`ΔE Base (${state.deltaEBase})`}
          description="Base threshold for region growing"
          min={6}
          max={16}
          step={1}
          value={state.deltaEBase}
          onChange={(val) => onSliderChange('deltaEBase', val)}
        />

        <SliderField
          label={`ΔE Small Boost (+${state.deltaESmallBoost})`}
          description="Threshold increase for expansion"
          min={0}
          max={6}
          step={1}
          value={state.deltaESmallBoost}
          onChange={(val) => onSliderChange('deltaESmallBoost', val)}
        />

        <SliderField
          label={`ΔE Tighten (-${state.deltaELargeTighten})`}
          description="Contraction threshold for fine detail"
          min={0}
          max={6}
          step={1}
          value={state.deltaELargeTighten}
          onChange={(val) => onSliderChange('deltaELargeTighten', val)}
        />

        <SliderField
          label={`Max Region Pixels (${state.maxRegionPixels})`}
          description="Ceiling to stop runaway regions"
          min={10000}
          max={50000}
          step={1000}
          value={state.maxRegionPixels}
          onChange={(val) => onSliderChange('maxRegionPixels', val)}
        />

        <SliderField
          label={`Sample Count (${state.sampleCount})`}
          description="Pixels sampled for clustering"
          min={500}
          max={5000}
          step={100}
          value={state.sampleCount}
          onChange={(val) => onSliderChange('sampleCount', val)}
        />

        <SliderField
          label={`L Low Percentile (${lowPercent}%)`}
          description="Lower bound for lightness filtering"
          min={0}
          max={20}
          step={1}
          value={lowPercent}
          onChange={(val) => {
            const low = val / 100;
            const high = Math.max(low + 0.05, state.highLightPercentile);
            handleOptionChange({
              lowLightPercentile: low,
              highLightPercentile: Math.min(high, 0.99),
            });
          }}
        />

        <SliderField
          label={`L High Percentile (${highPercent}%)`}
          description="Upper bound for lightness filtering"
          min={80}
          max={100}
          step={1}
          value={highPercent}
          onChange={(val) => {
            const high = val / 100;
            const low = Math.min(state.lowLightPercentile, high - 0.05);
            handleOptionChange({
              lowLightPercentile: Math.max(low, 0),
              highLightPercentile: Math.min(high, 0.99),
            });
          }}
        />

        <SliderField
          label={`Pattern Threshold (${state.patternThreshold.toFixed(2)})`}
          description="Largest cluster ratio before flagging pattern"
          min={0.3}
          max={0.6}
          step={0.01}
          value={state.patternThreshold}
          onChange={(val) => onSliderChange('patternThreshold', val)}
        />

        <div className="flex items-center justify-between rounded-md border border-border bg-muted/50 px-3 py-2">
          <div>
            <p className="text-sm font-medium">Debug Overlay</p>
            <p className="text-xs text-muted-foreground">
              Show live stats & inspection box
            </p>
          </div>
          <input
            type="checkbox"
            className="h-4 w-4"
            checked={state.debugOverlay}
            onChange={(e) =>
              handleOptionChange({ debugOverlay: e.target.checked })
            }
          />
        </div>
      </div>
    </aside>
  );
}

interface FieldProps {
  label: string;
  description?: string;
  children: React.ReactNode;
}

function Field({ label, description, children }: FieldProps) {
  return (
    <div className="space-y-1">
      <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      {description ? (
        <p className="text-xs text-muted-foreground/80">{description}</p>
      ) : null}
      {children}
    </div>
  );
}

interface SliderFieldProps {
  label: string;
  description?: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (value: number) => void;
}

function SliderField({
  label,
  description,
  min,
  max,
  step,
  value,
  onChange,
}: SliderFieldProps) {
  return (
    <Field label={label} description={description}>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full"
      />
      <div className="flex justify-between text-[11px] text-muted-foreground">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </Field>
  );
}
