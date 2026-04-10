import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import type { RoleFormData, ScoringWeights } from './roleFormTypes';

const DIMENSIONS: { key: keyof ScoringWeights; label: string; description: string }[] = [
  { key: 'skills_match', label: 'Skills match', description: 'How closely the candidate\'s skills match the required and preferred skills.' },
  { key: 'experience_level', label: 'Experience level', description: 'Alignment between candidate experience and the specified minimum years.' },
  { key: 'education', label: 'Education', description: 'Degree or certification relevance to the education requirement.' },
  { key: 'location_match', label: 'Location match', description: 'Proximity or remote eligibility relative to the role\'s location type.' },
  { key: 'culture_signals', label: 'Culture signals', description: 'Soft signals like career trajectory, company types, and tenure patterns.' },
];

interface SliderProps {
  label: string;
  value: number;
  onChange: (val: number) => void;
}

function ScoringSlider({ label, value, onChange }: SliderProps) {
  const pct = ((value - 1) / 9) * 100;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '14px', fontWeight: 500, color: '#09090B' }}>{label}</span>
        <span
          style={{
            fontSize: '13px',
            fontWeight: 700,
            color: '#2563EB',
            minWidth: '20px',
            textAlign: 'right',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {value}
        </span>
      </div>
      <div style={{ position: 'relative', height: '6px' }}>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '3px',
            backgroundColor: '#E4E4E7',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            bottom: 0,
            width: `${pct}%`,
            borderRadius: '3px',
            backgroundColor: '#2563EB',
            transition: 'width 0.1s ease',
          }}
        />
        <input
          type="range"
          min={1}
          max={10}
          value={value}
          onChange={e => onChange(parseInt(e.target.value))}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            opacity: 0,
            cursor: 'pointer',
            height: '6px',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: `${pct}%`,
            transform: 'translate(-50%, -50%)',
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            backgroundColor: '#FFFFFF',
            border: '2px solid #2563EB',
            boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
            pointerEvents: 'none',
            transition: 'left 0.1s ease',
          }}
        />
      </div>
    </div>
  );
}

interface StepScoringProps {
  data: RoleFormData;
  onChange: (data: Partial<RoleFormData>) => void;
}

export default function StepScoring({ data, onChange }: StepScoringProps) {
  const [explainerOpen, setExplainerOpen] = useState(false);

  function updateWeight(key: keyof ScoringWeights, val: number) {
    onChange({ scoringWeights: { ...data.scoringWeights, [key]: val } });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div
        style={{
          padding: '16px',
          borderRadius: '10px',
          backgroundColor: '#EFF6FF',
          border: '1px solid #BFDBFE',
        }}
      >
        <p style={{ fontSize: '13px', color: '#1D4ED8', lineHeight: '1.5' }}>
          These weights shape how candidates are ranked. A higher value means that factor contributes more to the overall score. Defaults are calibrated for most engineering and product roles.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {DIMENSIONS.map(dim => (
          <ScoringSlider
            key={dim.key}
            label={dim.label}
            value={data.scoringWeights[dim.key]}
            onChange={val => updateWeight(dim.key, val)}
          />
        ))}
      </div>

      <div
        style={{
          borderRadius: '10px',
          border: '1px solid #E4E4E7',
          overflow: 'hidden',
        }}
      >
        <button
          type="button"
          onClick={() => setExplainerOpen(!explainerOpen)}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 16px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            textAlign: 'left',
          }}
        >
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#09090B' }}>How scoring works</span>
          {explainerOpen
            ? <ChevronUp size={16} style={{ color: '#71717A', flexShrink: 0 }} />
            : <ChevronDown size={16} style={{ color: '#71717A', flexShrink: 0 }} />
          }
        </button>

        {explainerOpen && (
          <div
            style={{
              padding: '0 16px 16px',
              borderTop: '1px solid #F4F4F5',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingTop: '14px' }}>
              <p style={{ fontSize: '13px', color: '#71717A', lineHeight: '1.6' }}>
                These weights determine how candidates are scored by our AI agents. A higher weight means that factor matters more when calculating the final score.
              </p>
              <p style={{ fontSize: '13px', color: '#71717A', lineHeight: '1.6' }}>
                For example, a candidate with perfect skills but limited experience will score differently depending on whether you weight skills higher than experience. Adjust these to match what actually matters for your team.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {DIMENSIONS.map(dim => (
                  <div key={dim.key} style={{ display: 'flex', gap: '10px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#2563EB', minWidth: '100px' }}>{dim.label}</span>
                    <span style={{ fontSize: '12px', color: '#71717A', lineHeight: '1.5' }}>{dim.description}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
