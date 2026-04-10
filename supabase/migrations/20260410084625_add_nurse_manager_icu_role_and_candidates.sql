/*
  # Add Nurse Manager — ICU Role and Healthcare Candidates

  1. New Role
    - `Nurse Manager — ICU` for the seeded Midwest Health System org
    - Full-time, Chicago IL, compensation range $95K–$120K

  2. New Candidates (10 total)
    - All attached to the Nurse Manager — ICU role
    - Covers pipeline stages: discovered (New), scored (Screening),
      voice_qualified (Interview), archived (Rejected)
    - Realistic healthcare credentials, titles, and experience

  3. Agent Activity Log
    - 5 entries matching the requested dashboard activity feed
    - Healthcare-specific actions referencing the role and candidates

  Notes
    - Uses org `6daa17b0-4e50-443a-9580-724a6547234a` (Midwest Health System seed org)
    - All score values stored as 0.00–1.00 decimals
    - created_at timestamps simulate realistic sourcing timeline
*/

DO $$
DECLARE
  v_org_id UUID := '6daa17b0-4e50-443a-9580-724a6547234a';
  v_role_id UUID := gen_random_uuid();

  v_c1_id UUID := gen_random_uuid();
  v_c2_id UUID := gen_random_uuid();
  v_c3_id UUID := gen_random_uuid();
  v_c4_id UUID := gen_random_uuid();
  v_c5_id UUID := gen_random_uuid();
  v_c6_id UUID := gen_random_uuid();
  v_c7_id UUID := gen_random_uuid();
  v_c8_id UUID := gen_random_uuid();
  v_c9_id UUID := gen_random_uuid();
  v_c10_id UUID := gen_random_uuid();

  v_np_role_id UUID;

BEGIN

INSERT INTO roles (id, org_id, title, location, remote, employment_type, experience_min, experience_max, must_have_requirements, nice_to_have_requirements, compensation_min, compensation_max, compensation_currency, description, target_candidate_volume, outreach_tone, status)
VALUES (
  v_role_id, v_org_id, 'Nurse Manager — ICU', 'Chicago, IL', false, 'full-time', 5, 15,
  ARRAY['RN License (IL)', 'BSN or higher', 'ICU Experience (3+ years)', 'BLS', 'ACLS'],
  ARRAY['MSN', 'CCRN', 'Charge Nurse Experience', 'Epic EMR', 'Joint Commission Compliance'],
  95000, 120000, 'USD',
  'Lead and manage a 20-bed medical ICU. Responsible for clinical oversight, staff scheduling, quality improvement, and Joint Commission compliance. Reports to Director of Critical Care Services.',
  50, 'professional', 'active'
);

INSERT INTO voice_settings (role_id, enabled, score_threshold, calling_window_start, calling_window_end, max_attempts, retry_interval_hours, leave_voicemail, auto_advance_qualified, outreach_tone, verification_points, escalation_rules, escalation_email)
VALUES (
  v_role_id, true, 0.75, '09:00', '19:00', 3, 8, true, false, 'professional',
  '[{"label": "RN License IL", "question": "Can you confirm you hold an active registered nurse license in Illinois?", "required": true}, {"label": "ICU Experience", "question": "How many years of ICU nursing experience do you have?", "required": true}, {"label": "ACLS Certification", "question": "Is your ACLS certification currently active?", "required": true}, {"label": "Leadership Experience", "question": "Have you held a charge nurse or management role?", "required": false}]'::jsonb,
  '{"on_human_request": true, "on_ambiguous_credentials": true, "on_high_score": true, "high_score_threshold": 0.92, "on_all_calls": false}'::jsonb,
  'hiring-manager@midwesthealth.com'
);

INSERT INTO candidates (id, org_id, role_id, full_name, email, phone, current_title, current_company, location, experience_years, skills, licenses, certifications, education, source, score, score_breakdown, score_rationale, pipeline_stage, created_at, updated_at)
VALUES
  (v_c1_id, v_org_id, v_role_id, 'Maria Santos', 'm.santos@email.com', '312-555-1101',
   'ICU RN, BSN', 'Northwestern Memorial Hospital', 'Chicago, IL', 10,
   ARRAY['ICU', 'Critical Care', 'ACLS', 'BLS', 'Epic EMR'],
   ARRAY['RN (IL)'], ARRAY['ACLS', 'BLS', 'CCRN'], 'BSN, Loyola University Chicago',
   'Scout', 0.960,
   '{"hard_qualification": 0.97, "experience_trajectory": 0.95, "skills_adjacency": 0.96, "engagement_propensity": 0.93}'::jsonb,
   'Maria has 10 years of ICU experience at a Level 1 academic medical center. All required credentials active. CCRN certification exceeds nice-to-have criteria. Strong candidate for a nurse manager track.',
   'discovered', NOW() - INTERVAL '1 hour', NOW() - INTERVAL '1 hour'),

  (v_c2_id, v_org_id, v_role_id, 'James Mitchell', 'j.mitchell@email.com', '312-555-1102',
   'Family Nurse Practitioner', 'Chicago Health Partners', 'Chicago, IL', 8,
   ARRAY['Family Practice', 'Primary Care', 'EHR Systems', 'Patient Assessment', 'Chronic Disease Management'],
   ARRAY['NP License (IL)'], ARRAY['BLS', 'DEA Registration'], 'MSN, FNP-C, Rush University',
   'Scout', 0.940,
   '{"hard_qualification": 0.93, "experience_trajectory": 0.94, "skills_adjacency": 0.95, "engagement_propensity": 0.90}'::jsonb,
   'James has 8 years of primary care NP experience. MSN and FNP-C certification. Strong chronic disease management background. DEA registration active.',
   'scored', NOW() - INTERVAL '3 hours', NOW() - INTERVAL '3 hours'),

  (v_c3_id, v_org_id, v_role_id, 'Angela Washington', 'a.washington@email.com', '312-555-1103',
   'Nurse Manager', 'Advocate Aurora Health', 'Chicago, IL', 12,
   ARRAY['Nurse Management', 'Staff Scheduling', 'Quality Improvement', 'Joint Commission Compliance', 'Budgeting'],
   ARRAY['RN (IL)'], ARRAY['BLS', 'ACLS'], 'MSN, University of Illinois Chicago',
   'Scout', 0.910,
   '{"hard_qualification": 0.92, "experience_trajectory": 0.93, "skills_adjacency": 0.90, "engagement_propensity": 0.88}'::jsonb,
   'Angela has 12 years of nursing experience including current nurse manager role. MSN exceeds education requirement. Joint Commission compliance background is a direct match.',
   'voice_qualified', NOW() - INTERVAL '5 hours', NOW() - INTERVAL '5 hours'),

  (v_c4_id, v_org_id, v_role_id, 'Dr. Robert Kim', 'r.kim@email.com', '312-555-1104',
   'Internal Medicine Physician', 'Rush University Medical Center', 'Chicago, IL', 15,
   ARRAY['Internal Medicine', 'Hospital Medicine', 'EMR', 'Patient Safety', 'Clinical Leadership'],
   ARRAY['MD License (IL)'], ARRAY['BLS', 'ACLS', 'Board Certified — Internal Medicine'], 'MD, Northwestern University Feinberg School of Medicine',
   'Scout', 0.890,
   '{"hard_qualification": 0.91, "experience_trajectory": 0.94, "skills_adjacency": 0.87, "engagement_propensity": 0.84}'::jsonb,
   'Dr. Kim has 15 years of hospital medicine experience and strong clinical leadership background. Board certified in Internal Medicine. Patient safety focus aligns with ICU management responsibilities.',
   'discovered', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),

  (v_c5_id, v_org_id, v_role_id, 'Patricia Hernandez', NULL, '312-555-1105',
   'Acute Care Nurse Practitioner', 'Regional Medical Center', 'Chicago, IL', 9,
   ARRAY['Acute Care', 'Nurse Practitioner', 'Ventilator Management', 'Central Line Insertion', 'ICU Protocols'],
   ARRAY['NP License (IL)', 'RN (IL)'], ARRAY['BLS', 'ACLS'], 'DNP, APRN, Loyola University Chicago',
   'Scout', 0.870,
   '{"hard_qualification": 0.88, "experience_trajectory": 0.86, "skills_adjacency": 0.89, "engagement_propensity": 0.85}'::jsonb,
   'Patricia has 9 years of acute care NP experience with ICU protocols proficiency. DNP exceeds requirement. Ventilator management and central line insertion are strong differentiators.',
   'discovered', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),

  (v_c6_id, v_org_id, v_role_id, 'David Thompson', NULL, '312-555-1106',
   'Emergency RN, BSN', 'Level I Trauma Center', 'Chicago, IL', 6,
   ARRAY['Emergency Department', 'Triage', 'Trauma', 'BLS', 'PALS'],
   ARRAY['RN (IL)'], ARRAY['BLS', 'ACLS', 'PALS'], 'BSN, DePaul University',
   'Scout', 0.850,
   '{"hard_qualification": 0.84, "experience_trajectory": 0.85, "skills_adjacency": 0.85, "engagement_propensity": 0.87}'::jsonb,
   'David has 6 years of high-acuity emergency nursing experience. All required credentials active. ED to ICU transition would require assessment, but trauma background is relevant.',
   'scored', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),

  (v_c7_id, v_org_id, v_role_id, 'Rachel Foster', NULL, '312-555-1107',
   'Labor & Delivery RN', 'Women''s & Children''s Hospital', 'Chicago, IL', 7,
   ARRAY['Labor & Delivery', 'Postpartum', 'Fetal Monitoring', 'Neonatal Resuscitation', 'Patient Education'],
   ARRAY['RN (IL)'], ARRAY['BLS', 'ACLS', 'NRP'], 'MSN, Rush University',
   'Scout', 0.820,
   '{"hard_qualification": 0.81, "experience_trajectory": 0.83, "skills_adjacency": 0.82, "engagement_propensity": 0.83}'::jsonb,
   'Rachel has 7 years of L&D nursing with MSN. NRP certification demonstrates high-acuity competency. Specialty is not ICU but MSN and patient education skills support a management track.',
   'discovered', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),

  (v_c8_id, v_org_id, v_role_id, 'Michael Chen', NULL, '312-555-1108',
   'Physician Assistant', 'Sports Medicine & Orthopedics Group', 'Chicago, IL', 5,
   ARRAY['Orthopedics', 'Surgical Assist', 'Casting/Splinting', 'Post-Op Care', 'Sports Medicine'],
   ARRAY['PA License (IL)'], ARRAY['BLS', 'ACLS'], 'MPAS, PA-C, Rosalind Franklin University',
   'Scout', 0.790,
   '{"hard_qualification": 0.77, "experience_trajectory": 0.79, "skills_adjacency": 0.81, "engagement_propensity": 0.84}'::jsonb,
   'Michael has 5 years of PA experience in orthopedics. PA-C certified. Specialty mismatch with ICU management — orthopedic focus limits direct ICU credential alignment.',
   'discovered', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),

  (v_c9_id, v_org_id, v_role_id, 'Sandra Williams', NULL, '312-555-1109',
   'Cardiac ICU RN', 'Cardiac Care Institute', 'Chicago, IL', 8,
   ARRAY['Cardiac ICU', 'Hemodynamic Monitoring', 'IABP', 'CRRT', 'Code Blue Response'],
   ARRAY['RN (IL)'], ARRAY['BLS', 'ACLS', 'CCRN'], 'BSN, University of Illinois Chicago',
   'Scout', 0.760,
   '{"hard_qualification": 0.76, "experience_trajectory": 0.77, "skills_adjacency": 0.76, "engagement_propensity": 0.74}'::jsonb,
   'Sandra has strong cardiac ICU credentials and CCRN. Compensation expectation above range. Expressed limited interest in moving to a management role. Archived after screening call.',
   'archived', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),

  (v_c10_id, v_org_id, v_role_id, 'Dr. Lisa Park', NULL, '312-555-1110',
   'Family Medicine Physician', 'Family Practice Associates', 'Chicago, IL', 11,
   ARRAY['Family Medicine', 'Outpatient Care', 'Preventive Medicine', 'Telemedicine', 'EHR Documentation'],
   ARRAY['DO License (IL)'], ARRAY['BLS', 'Board Certified — Family Medicine'], 'DO, Midwestern University',
   'Scout', 0.730,
   '{"hard_qualification": 0.72, "experience_trajectory": 0.76, "skills_adjacency": 0.73, "engagement_propensity": 0.75}'::jsonb,
   'Dr. Park has 11 years of outpatient family medicine. Board certified. Outpatient focus has limited ICU adjacency — inpatient and critical care experience not confirmed.',
   'discovered', NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days');

SELECT id INTO v_np_role_id FROM roles WHERE org_id = v_org_id AND title = 'Nurse Practitioner — Primary Care' LIMIT 1;

INSERT INTO agent_activity_log (org_id, role_id, candidate_id, agent_name, action, detail, created_at)
VALUES
  (v_org_id, v_role_id, NULL, 'scout', 'Found 14 new candidates for Nurse Manager — ICU', 'Sources: Doximity, LinkedIn, Vivian Health, professional network', NOW() - INTERVAL '2 minutes'),
  (v_org_id, v_role_id, v_c1_id, 'signal', 'Scored Maria Santos, RN at 96% match', 'ICU experience confirmed · ACLS active · Epic EMR · all hard quals passed', NOW() - INTERVAL '15 minutes'),
  (v_org_id, v_role_id, v_c4_id, 'engage', 'Drafted outreach for Dr. Robert Kim', 'Email · professional tone · board certification and clinical leadership referenced', NOW() - INTERVAL '1 hour'),
  (v_org_id, v_np_role_id, NULL, 'scout', 'Found 8 candidates for Nurse Practitioner — Primary Care', 'Sources: Doximity, LinkedIn, specialty NP networks', NOW() - INTERVAL '3 hours'),
  (v_org_id, v_role_id, NULL, 'cortex', 'New role created: Nurse Manager — ICU', 'Agents initialized · sourcing targets set · voice screening configured', NOW() - INTERVAL '5 hours');

END $$;
