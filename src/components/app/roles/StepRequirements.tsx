import type { RoleFormData } from './roleFormTypes';
import TagInput from './TagInput';
import { Loader2, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../../lib/auth';
import { supabase } from '../../../lib/supabase';

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
  isAIGenerated: boolean;
  onAIGeneratedChange: (isGenerated: boolean) => void;
  onGenerationError: (message: string) => void;
}

type JobDescriptionData = {
  summary?: string;
  responsibilities?: string[];
  qualifications?: string[];
};

function buildDescriptionFromAIResponse(output: JobDescriptionData): string {
  const lines: string[] = [];
  lines.push((output.summary || '').trim());

  if ((output.responsibilities || []).length > 0) {
    lines.push('', 'Responsibilities');
    lines.push(...(output.responsibilities || []).map(item => `• ${item}`));
  }

  if ((output.qualifications || []).length > 0) {
    lines.push('', 'Required Qualifications');
    lines.push(...(output.qualifications || []).map(item => `• ${item}`));
  }

  return lines.join('\n');
}

export default function StepRequirements({
  data,
  onChange,
  isAIGenerated,
  onAIGeneratedChange,
  onGenerationError,
}: StepRequirementsProps) {
  const { user } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);

  async function handleGenerateDescription() {
    const requirementInputs = [...data.mustHaveSkills, ...data.niceToHaveSkills].filter(Boolean);
    if (!data.title.trim()) {
      onGenerationError('Please add a role title before generating a job description.');
      return;
    }

    setIsGenerating(true);
    try {
      const { data: responseData, error } = await supabase.functions.invoke<{ data?: JobDescriptionData }>('ai-generate-job', {
        body: {
          title: data.title || '',
          department: data.department || '',
          requirements: requirementInputs || [],
        },
      });

      if (error) {
        console.error('AI generation failed:', error);
        onGenerationError(`AI generation failed: ${error.message}`);
        return;
      }

      if (responseData?.data) {
        onChange({
          description: buildDescriptionFromAIResponse({
            summary: responseData.data.summary || '',
            responsibilities: responseData.data.responsibilities || [],
            qualifications: responseData.data.qualifications || [],
          }),
        });
      }
      onAIGeneratedChange(true);
      if (user?.org_id) {
        await supabase.from('agent_activity_log').insert({
          org_id: user.org_id,
          role_id: null,
          candidate_id: null,
          agent_name: 'cortex',
          action: 'Generated role description with AI',
          detail: `Generated draft description for ${data.title.trim()}.`,
          metadata: {},
        });
      }
    } catch (error) {
      console.error('AI generation failed:', error);
      onGenerationError(`AI generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsGenerating(false);
    }
  }

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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{ ...labelStyle, marginBottom: 0 }}>Role description</label>
            {isAIGenerated && (
              <span
                style={{
                  fontSize: '11px',
                  color: '#2563EB',
                  backgroundColor: '#EFF6FF',
                  border: '1px solid #BFDBFE',
                  borderRadius: '999px',
                  padding: '2px 8px',
                  fontWeight: 600,
                }}
              >
                Generated by AI
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={handleGenerateDescription}
            disabled={isGenerating}
            style={{
              height: '30px',
              borderRadius: '8px',
              border: '1px solid #D4D4D8',
              backgroundColor: isGenerating ? '#F4F4F5' : '#FFFFFF',
              color: '#09090B',
              fontSize: '12px',
              fontWeight: 600,
              cursor: isGenerating ? 'not-allowed' : 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '0 10px',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            {isGenerating ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles size={14} />
                Generate with AI
              </>
            )}
          </button>
        </div>
        <p style={{ fontSize: '11px', color: '#A1A1AA', marginBottom: '8px' }}>Powered by AI</p>
        <textarea
          value={data.description}
          onChange={e => {
            onChange({ description: e.target.value });
            if (isAIGenerated) onAIGeneratedChange(false);
          }}
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
