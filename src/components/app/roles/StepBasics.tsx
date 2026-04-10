import type { RoleFormData } from './roleFormTypes';

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

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '13px',
  fontWeight: 600,
  color: '#09090B',
  marginBottom: '6px',
};

function FormInput({ label, required, ...props }: { label: string; required?: boolean } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label style={labelStyle}>
        {label}{required && <span style={{ color: '#EF4444', marginLeft: '3px' }}>*</span>}
      </label>
      <input
        style={inputStyle}
        onFocus={e => { e.currentTarget.style.borderColor = '#2563EB'; e.currentTarget.style.boxShadow = '0 0 0 3px #EFF6FF'; }}
        onBlur={e => { e.currentTarget.style.borderColor = '#E4E4E7'; e.currentTarget.style.boxShadow = 'none'; }}
        {...props}
      />
    </div>
  );
}

function FormSelect({ label, required, children, ...props }: { label: string; required?: boolean } & React.SelectHTMLAttributes<HTMLSelectElement> & { children: React.ReactNode }) {
  return (
    <div>
      <label style={labelStyle}>
        {label}{required && <span style={{ color: '#EF4444', marginLeft: '3px' }}>*</span>}
      </label>
      <select
        style={{ ...inputStyle, cursor: 'pointer', appearance: 'none', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23A1A1AA' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 14px center', paddingRight: '36px' }}
        onFocus={e => { e.currentTarget.style.borderColor = '#2563EB'; e.currentTarget.style.boxShadow = '0 0 0 3px #EFF6FF'; }}
        onBlur={e => { e.currentTarget.style.borderColor = '#E4E4E7'; e.currentTarget.style.boxShadow = 'none'; }}
        {...props}
      >
        {children}
      </select>
    </div>
  );
}

interface StepBasicsProps {
  data: RoleFormData;
  onChange: (data: Partial<RoleFormData>) => void;
  errors: Record<string, string>;
}

export default function StepBasics({ data, onChange, errors }: StepBasicsProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <FormInput
        label="Job title"
        required
        value={data.title}
        onChange={e => onChange({ title: e.target.value })}
        placeholder="Nurse Manager — ICU"
        style={{ ...inputStyle, borderColor: errors.title ? '#EF4444' : '#E4E4E7', boxShadow: errors.title ? '0 0 0 3px #FEF2F2' : 'none' }}
      />
      {errors.title && <p style={{ fontSize: '12px', color: '#EF4444', marginTop: '-16px' }}>{errors.title}</p>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <FormSelect
          label="Department"
          value={data.department}
          onChange={e => onChange({ department: e.target.value })}
        >
          <option value="">Select department</option>
          {['Nursing', 'Medical Staff', 'Allied Health', 'Pharmacy', 'Behavioral Health', 'Administration', 'Engineering', 'Product', 'Design', 'Marketing', 'Sales', 'Operations', 'Finance', 'HR / People', 'Other'].map(d => (
            <option key={d} value={d}>{d}</option>
          ))}
        </FormSelect>

        <FormSelect
          label="Seniority level"
          value={data.seniority}
          onChange={e => onChange({ seniority: e.target.value })}
        >
          <option value="">Select level</option>
          {['Junior', 'Mid-Level', 'Senior', 'Lead', 'Director', 'VP', 'C-Suite'].map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </FormSelect>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <FormSelect
          label="Employment type"
          value={data.employmentType}
          onChange={e => onChange({ employmentType: e.target.value })}
        >
          {['Full-time', 'Part-time', 'Contract', 'Freelance'].map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </FormSelect>

        <FormSelect
          label="Location"
          value={data.locationType}
          onChange={e => onChange({ locationType: e.target.value, cityRegion: e.target.value === 'Remote' ? '' : data.cityRegion })}
        >
          {['Remote', 'Hybrid', 'On-site'].map(l => (
            <option key={l} value={l}>{l}</option>
          ))}
        </FormSelect>
      </div>

      {(data.locationType === 'Hybrid' || data.locationType === 'On-site') && (
        <FormInput
          label="City or region"
          required
          value={data.cityRegion}
          onChange={e => onChange({ cityRegion: e.target.value })}
          placeholder="San Francisco, CA"
          style={{ ...inputStyle, borderColor: errors.cityRegion ? '#EF4444' : '#E4E4E7' }}
        />
      )}

      <div>
        <label style={labelStyle}>Salary range <span style={{ color: '#A1A1AA', fontWeight: 400 }}>(optional)</span></label>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <select
            value={data.currency}
            onChange={e => onChange({ currency: e.target.value })}
            style={{
              height: '44px',
              padding: '0 10px',
              borderRadius: '10px',
              border: '1px solid #E4E4E7',
              backgroundColor: '#FFFFFF',
              fontSize: '13px',
              fontWeight: 600,
              color: '#09090B',
              outline: 'none',
              cursor: 'pointer',
              flexShrink: 0,
              fontFamily: 'Inter, sans-serif',
            }}
            onFocus={e => { e.currentTarget.style.borderColor = '#2563EB'; }}
            onBlur={e => { e.currentTarget.style.borderColor = '#E4E4E7'; }}
          >
            <option>USD</option>
            <option>EUR</option>
            <option>GBP</option>
            <option>CAD</option>
            <option>AUD</option>
          </select>
          <input
            type="number"
            value={data.salaryMin}
            onChange={e => onChange({ salaryMin: e.target.value })}
            placeholder="80,000"
            style={{ ...inputStyle, flex: 1 }}
            onFocus={e => { e.currentTarget.style.borderColor = '#2563EB'; e.currentTarget.style.boxShadow = '0 0 0 3px #EFF6FF'; }}
            onBlur={e => { e.currentTarget.style.borderColor = '#E4E4E7'; e.currentTarget.style.boxShadow = 'none'; }}
          />
          <span style={{ fontSize: '14px', color: '#A1A1AA', flexShrink: 0 }}>to</span>
          <input
            type="number"
            value={data.salaryMax}
            onChange={e => onChange({ salaryMax: e.target.value })}
            placeholder="120,000"
            style={{ ...inputStyle, flex: 1 }}
            onFocus={e => { e.currentTarget.style.borderColor = '#2563EB'; e.currentTarget.style.boxShadow = '0 0 0 3px #EFF6FF'; }}
            onBlur={e => { e.currentTarget.style.borderColor = '#E4E4E7'; e.currentTarget.style.boxShadow = 'none'; }}
          />
        </div>
      </div>
    </div>
  );
}
