import type { RoleFormData } from './roleFormTypes';
import TagInput from './TagInput';

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '13px',
  fontWeight: 600,
  color: '#09090B',
  marginBottom: '6px',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  height: '44px',
  padding: '0 14px',
  borderRadius: '10px',
  border: '1px solid #E4E4E7',
  backgroundColor: '#FFFFFF',
  fontSize: '14px',
  color: '#09090B',
  outline: 'none',
  transition: 'border-color 0.15s, box-shadow 0.15s',
  fontFamily: 'Inter, sans-serif',
  boxSizing: 'border-box',
};

interface StepRequirementsProps {
  data: RoleFormData;
  onChange: (data: Partial<RoleFormData>) => void;
}

export default function StepRequirements({ data, onChange }: StepRequirementsProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <label style={labelStyle}>Required skills</label>
        <p style={{ fontSize: '12px', color: '#A1A1AA', marginBottom: '8px' }}>
          Type a skill and press Enter
        </p>
        <TagInput
          tags={data.mustHaveSkills}
          onChange={tags => onChange({ mustHaveSkills: tags })}
          placeholder="Type a skill and press Enter"
          variant="primary"
        />
      </div>

      <div>
        <label style={labelStyle}>Nice-to-have skills</label>
        <p style={{ fontSize: '12px', color: '#A1A1AA', marginBottom: '8px' }}>
          Preferred but not required
        </p>
        <TagInput
          tags={data.niceToHaveSkills}
          onChange={tags => onChange({ niceToHaveSkills: tags })}
          placeholder="Type a skill and press Enter"
          variant="secondary"
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div>
          <label style={labelStyle}>Minimum years of experience</label>
          <input
            type="number"
            min={0}
            max={30}
            value={data.experienceMin}
            onChange={e => onChange({ experienceMin: e.target.value })}
            placeholder="3"
            style={inputStyle}
            onFocus={e => { e.currentTarget.style.borderColor = '#2563EB'; e.currentTarget.style.boxShadow = '0 0 0 3px #EFF6FF'; }}
            onBlur={e => { e.currentTarget.style.borderColor = '#E4E4E7'; e.currentTarget.style.boxShadow = 'none'; }}
          />
        </div>

        <div>
          <label style={labelStyle}>Education requirement</label>
          <select
            value={data.education}
            onChange={e => onChange({ education: e.target.value })}
            style={{
              ...inputStyle,
              cursor: 'pointer',
              appearance: 'none',
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23A1A1AA' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 14px center',
              paddingRight: '36px',
            }}
            onFocus={e => { e.currentTarget.style.borderColor = '#2563EB'; e.currentTarget.style.boxShadow = '0 0 0 3px #EFF6FF'; }}
            onBlur={e => { e.currentTarget.style.borderColor = '#E4E4E7'; e.currentTarget.style.boxShadow = 'none'; }}
          >
            {["No requirement", "High school", "Bachelor's", "Master's", "PhD", "Bootcamp / Certification"].map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label style={labelStyle}>Role description</label>
        <textarea
          value={data.description}
          onChange={e => onChange({ description: e.target.value })}
          rows={6}
          placeholder="Describe the role, unit, patient population, and requirements..."
          style={{
            width: '100%',
            padding: '12px 14px',
            borderRadius: '10px',
            border: '1px solid #E4E4E7',
            backgroundColor: '#FFFFFF',
            fontSize: '14px',
            color: '#09090B',
            outline: 'none',
            resize: 'vertical',
            fontFamily: 'Inter, sans-serif',
            lineHeight: '1.6',
            transition: 'border-color 0.15s, box-shadow 0.15s',
            boxSizing: 'border-box',
          }}
          onFocus={e => { e.currentTarget.style.borderColor = '#2563EB'; e.currentTarget.style.boxShadow = '0 0 0 3px #EFF6FF'; }}
          onBlur={e => { e.currentTarget.style.borderColor = '#E4E4E7'; e.currentTarget.style.boxShadow = 'none'; }}
        />
        <p style={{ fontSize: '12px', color: '#A1A1AA', marginTop: '6px', lineHeight: '1.5' }}>
          Tip: The more detail you provide, the better our agents can match candidates.
        </p>
      </div>
    </div>
  );
}
