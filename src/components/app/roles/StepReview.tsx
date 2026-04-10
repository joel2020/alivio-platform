import { useState } from 'react';
import { MapPin, Briefcase, GraduationCap, DollarSign } from 'lucide-react';
import type { RoleFormData, ScoringWeights } from './roleFormTypes';

function formatSalary(val: string, currency: string) {
  if (!val) return null;
  const num = parseInt(val);
  return `${currency} ${num.toLocaleString()}`;
}

function Tag({ label, variant }: { label: string; variant?: 'primary' | 'secondary' }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '3px 10px',
        borderRadius: '6px',
        fontSize: '12px',
        fontWeight: 600,
        backgroundColor: variant === 'primary' ? '#EFF6FF' : '#F4F4F5',
        color: variant === 'primary' ? '#2563EB' : '#71717A',
      }}
    >
      {label}
    </span>
  );
}

const SCORING_LABELS: Record<keyof ScoringWeights, string> = {
  skills_match: 'Skills match',
  experience_level: 'Experience level',
  education: 'Education',
  location_match: 'Location match',
  culture_signals: 'Culture signals',
};

interface StepReviewProps {
  data: RoleFormData;
}

export default function StepReview({ data }: StepReviewProps) {
  const [descExpanded, setDescExpanded] = useState(false);

  const locationDisplay = data.locationType === 'Remote'
    ? 'Remote'
    : `${data.locationType}${data.cityRegion ? ` · ${data.cityRegion}` : ''}`;

  const salaryDisplay = data.salaryMin || data.salaryMax
    ? `${formatSalary(data.salaryMin, data.currency) || '—'} – ${formatSalary(data.salaryMax, data.currency) || '—'}`
    : null;

  const descTruncated = data.description.length > 180;
  const descText = descTruncated && !descExpanded
    ? data.description.slice(0, 180) + '...'
    : data.description;

  const sectionLabel: React.CSSProperties = {
    fontSize: '11px',
    fontWeight: 600,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.06em',
    color: '#A1A1AA',
    marginBottom: '12px',
  };

  const divider: React.CSSProperties = {
    borderBottom: '1px solid #F4F4F5',
    marginBottom: '20px',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
      <div
        style={{
          borderRadius: '12px',
          border: '1px solid #E4E4E7',
          overflow: 'hidden',
          backgroundColor: '#FFFFFF',
        }}
      >
        <div
          style={{
            padding: '20px 24px',
            backgroundColor: '#FAFAFA',
            borderBottom: '1px solid #E4E4E7',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <h3
                style={{
                  fontSize: '18px',
                  fontWeight: 700,
                  color: '#09090B',
                  letterSpacing: '-0.02em',
                  marginBottom: '4px',
                }}
              >
                {data.title || <span style={{ color: '#A1A1AA', fontWeight: 400 }}>Untitled role</span>}
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                {data.department && (
                  <span style={{ fontSize: '13px', color: '#71717A' }}>{data.department}</span>
                )}
                {data.seniority && (
                  <>
                    <span style={{ color: '#E4E4E7' }}>·</span>
                    <span style={{ fontSize: '13px', color: '#71717A' }}>{data.seniority}</span>
                  </>
                )}
              </div>
            </div>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 600,
                backgroundColor: '#F0FDF4',
                color: '#059669',
              }}
            >
              <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#10B981', flexShrink: 0, display: 'inline-block' }} />
              Active
            </span>
          </div>
        </div>

        <div style={{ padding: '20px 24px' }}>
          <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <MapPin size={14} style={{ color: '#A1A1AA', flexShrink: 0 }} />
              <span style={{ fontSize: '13px', color: '#71717A' }}>{locationDisplay}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Briefcase size={14} style={{ color: '#A1A1AA', flexShrink: 0 }} />
              <span style={{ fontSize: '13px', color: '#71717A' }}>{data.employmentType}</span>
            </div>
            {salaryDisplay && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <DollarSign size={14} style={{ color: '#A1A1AA', flexShrink: 0 }} />
                <span style={{ fontSize: '13px', color: '#71717A' }}>{salaryDisplay}</span>
              </div>
            )}
            {data.experienceMin && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '13px', color: '#71717A' }}>{data.experienceMin}+ years exp.</span>
              </div>
            )}
            {data.education !== 'No requirement' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <GraduationCap size={14} style={{ color: '#A1A1AA', flexShrink: 0 }} />
                <span style={{ fontSize: '13px', color: '#71717A' }}>{data.education}</span>
              </div>
            )}
          </div>

          <div style={divider} />

          {data.mustHaveSkills.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <p style={sectionLabel}>Required skills</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {data.mustHaveSkills.map(s => <Tag key={s} label={s} variant="primary" />)}
              </div>
            </div>
          )}

          {data.niceToHaveSkills.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <p style={sectionLabel}>Nice-to-have skills</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {data.niceToHaveSkills.map(s => <Tag key={s} label={s} variant="secondary" />)}
              </div>
            </div>
          )}

          {data.description && (
            <>
              <div style={divider} />
              <div style={{ marginBottom: '20px' }}>
                <p style={sectionLabel}>Description</p>
                <p style={{ fontSize: '13px', color: '#71717A', lineHeight: '1.6' }}>
                  {descText}
                </p>
                {descTruncated && (
                  <button
                    type="button"
                    onClick={() => setDescExpanded(!descExpanded)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: 600,
                      color: '#2563EB',
                      padding: '4px 0 0',
                    }}
                  >
                    {descExpanded ? 'Show less' : 'Show more'}
                  </button>
                )}
              </div>
            </>
          )}

          <div style={divider} />

          <div>
            <p style={sectionLabel}>Scoring weights</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {(Object.keys(data.scoringWeights) as Array<keyof ScoringWeights>).map(key => {
                const val = data.scoringWeights[key];
                const pct = (val / 10) * 100;
                return (
                  <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '12px', color: '#71717A', width: '120px', flexShrink: 0 }}>
                      {SCORING_LABELS[key]}
                    </span>
                    <div style={{ flex: 1, height: '6px', borderRadius: '3px', backgroundColor: '#E4E4E7', position: 'relative' }}>
                      <div
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          bottom: 0,
                          width: `${pct}%`,
                          borderRadius: '3px',
                          backgroundColor: val >= 7 ? '#2563EB' : val >= 5 ? '#93C5FD' : '#BFDBFE',
                        }}
                      />
                    </div>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#09090B', width: '16px', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                      {val}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div
        style={{
          marginTop: '16px',
          padding: '14px 16px',
          borderRadius: '10px',
          backgroundColor: '#FAFAFA',
          border: '1px solid #E4E4E7',
        }}
      >
        <p style={{ fontSize: '13px', color: '#71717A', lineHeight: '1.5' }}>
          Once launched, Scout will begin sourcing candidates immediately. Enrich and Signal agents will run in the background to score and rank them. You can pause or adjust the role at any time.
        </p>
      </div>
    </div>
  );
}
