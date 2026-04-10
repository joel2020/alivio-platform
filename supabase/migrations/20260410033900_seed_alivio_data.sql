/*
  # Alivio OS - Seed Data
  
  Inserts comprehensive demo data for Midwest Health System including:
  - 1 organization
  - 3 roles (ICU RN, NP Primary Care, Senior Software Engineer)
  - 40 candidates across all roles
  - 8 voice calls with full transcripts for Role 1
  - Voice settings for all 3 roles
  - 50 agent activity log entries
*/

DO $$
DECLARE
  v_org_id UUID := gen_random_uuid();
  v_role1_id UUID := gen_random_uuid();
  v_role2_id UUID := gen_random_uuid();
  v_role3_id UUID := gen_random_uuid();
  
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
  v_c11_id UUID := gen_random_uuid();
  v_c12_id UUID := gen_random_uuid();
  v_c13_id UUID := gen_random_uuid();
  v_c14_id UUID := gen_random_uuid();
  v_c15_id UUID := gen_random_uuid();
  v_c16_id UUID := gen_random_uuid();
  v_c17_id UUID := gen_random_uuid();
  v_c18_id UUID := gen_random_uuid();
  v_c19_id UUID := gen_random_uuid();
  v_c20_id UUID := gen_random_uuid();
  
  v_np1_id UUID := gen_random_uuid();
  v_np2_id UUID := gen_random_uuid();
  v_np3_id UUID := gen_random_uuid();
  v_np4_id UUID := gen_random_uuid();
  v_np5_id UUID := gen_random_uuid();
  v_np6_id UUID := gen_random_uuid();
  v_np7_id UUID := gen_random_uuid();
  v_np8_id UUID := gen_random_uuid();
  v_np9_id UUID := gen_random_uuid();
  v_np10_id UUID := gen_random_uuid();
  v_np11_id UUID := gen_random_uuid();
  v_np12_id UUID := gen_random_uuid();
  
  v_e1_id UUID := gen_random_uuid();
  v_e2_id UUID := gen_random_uuid();
  v_e3_id UUID := gen_random_uuid();
  v_e4_id UUID := gen_random_uuid();
  v_e5_id UUID := gen_random_uuid();
  v_e6_id UUID := gen_random_uuid();
  v_e7_id UUID := gen_random_uuid();
  v_e8_id UUID := gen_random_uuid();
  
  v_call1_id UUID := gen_random_uuid();
  v_call2_id UUID := gen_random_uuid();
  v_call3_id UUID := gen_random_uuid();
  v_call4_id UUID := gen_random_uuid();
  v_call5_id UUID := gen_random_uuid();
  v_call6_id UUID := gen_random_uuid();
  v_call7_id UUID := gen_random_uuid();
  v_call8_id UUID := gen_random_uuid();

BEGIN

INSERT INTO organizations (id, name, size, industry)
VALUES (v_org_id, 'Midwest Health System', '201-1000', 'healthcare');

INSERT INTO roles (id, org_id, title, location, remote, employment_type, experience_min, experience_max, must_have_requirements, nice_to_have_requirements, compensation_min, compensation_max, compensation_currency, target_candidate_volume, outreach_tone, status)
VALUES
  (v_role1_id, v_org_id, 'Registered Nurse — ICU', 'Chicago, IL', false, 'full-time', 3, 7, 
   ARRAY['RN License (IL)', 'BLS', 'ACLS', 'ICU Experience'],
   ARRAY['BSN', 'CCRN', 'Charge Nurse Experience'],
   75000, 95000, 'USD', 50, 'conversational', 'active'),
  (v_role2_id, v_org_id, 'Nurse Practitioner — Primary Care', 'Remote — US', true, 'full-time', 2, 10,
   ARRAY['NP License', 'DEA Registration', 'Primary Care Experience'],
   ARRAY['DNP', 'Bilingual Spanish'],
   110000, 135000, 'USD', 30, 'professional', 'active'),
  (v_role3_id, v_org_id, 'Senior Software Engineer', 'Austin, TX', false, 'full-time', 5, 12,
   ARRAY['Python', 'TypeScript', 'Cloud Infrastructure', 'System Design'],
   ARRAY['ML/AI Experience', 'Healthcare Domain'],
   160000, 200000, 'USD', 25, 'conversational', 'paused');

INSERT INTO candidates (id, org_id, role_id, full_name, email, phone, current_title, current_company, location, experience_years, skills, licenses, certifications, education, source, score, score_breakdown, score_rationale, pipeline_stage)
VALUES
  (v_c1_id, v_org_id, v_role1_id, 'Sarah Chen', 'sarah.chen@example.com', '312-555-0101', 'Staff RN — ICU', 'Northwestern Memorial Hospital', 'Chicago, IL', 5,
   ARRAY['ventilator management', 'hemodynamic monitoring', 'rapid response', 'Epic EMR'],
   ARRAY['RN (IL)'], ARRAY['BLS', 'ACLS', 'CCRN'], 'BSN, Loyola University Chicago', 'Professional network',
   0.940, '{"hard_qualification": 0.95, "experience_trajectory": 0.90, "skills_adjacency": 0.94, "engagement_propensity": 0.92}'::jsonb,
   'Sarah matches all must-have requirements: active RN license (IL), BLS and ACLS certified, 5 years of direct ICU experience at a Level 1 trauma center. BSN and CCRN exceed nice-to-have criteria.',
   'voice_qualified'),

  (v_c2_id, v_org_id, v_role1_id, 'Marcus Williams', 'marcus.williams@example.com', '312-555-0102', 'ICU/CCU RN', 'Rush University Medical Center', 'Chicago, IL', 7,
   ARRAY['cardiac monitoring', 'ECMO', 'code team', 'Cerner'],
   ARRAY['RN (IL)'], ARRAY['BLS', 'ACLS', 'CCRN'], 'BSN, University of Illinois Chicago', 'LinkedIn',
   0.910, '{"hard_qualification": 0.93, "experience_trajectory": 0.92, "skills_adjacency": 0.88, "engagement_propensity": 0.89}'::jsonb,
   'Marcus has 7 years of ICU/CCU experience at Rush University Medical Center. All required credentials active. CCRN certification demonstrates advanced clinical competency.',
   'voice_qualified'),

  (v_c3_id, v_org_id, v_role1_id, 'Priya Patel', 'priya.patel@example.com', '312-555-0103', 'ICU RN', 'Advocate Health', 'Chicago, IL', 4,
   ARRAY['critical care', 'patient assessment', 'Epic EMR', 'ventilator management'],
   ARRAY['RN (IL)'], ARRAY['BLS', 'CCRN'], 'BSN, DePaul University', 'Professional network',
   0.870, '{"hard_qualification": 0.85, "experience_trajectory": 0.84, "skills_adjacency": 0.90, "engagement_propensity": 0.88}'::jsonb,
   'Priya has strong ICU experience and holds CCRN. ACLS renewal status unclear — flagged for verification. Strong skills alignment.',
   'voice_qualified'),

  (v_c4_id, v_org_id, v_role1_id, 'David Kim', 'david.kim@example.com', '312-555-0104', 'ICU RN', 'Lurie Children''s Hospital', 'Chicago, IL', 3,
   ARRAY['pediatric critical care', 'ventilator management', 'PALS'],
   ARRAY['RN (IL)'], ARRAY['BLS', 'ACLS'], 'BSN, Rush University', 'LinkedIn',
   0.850, '{"hard_qualification": 0.87, "experience_trajectory": 0.83, "skills_adjacency": 0.85, "engagement_propensity": 0.81}'::jsonb,
   'David meets minimum experience requirement with 3 years pediatric ICU. IL license and required certs confirmed. Pediatric focus may require adult ICU adaptation.',
   'scored'),

  (v_c5_id, v_org_id, v_role1_id, 'Maria Gonzalez', 'maria.gonzalez@example.com', '312-555-0105', 'ICU RN (between positions)', 'Previously Advocate Illinois Masonic', 'Chicago, IL', 6,
   ARRAY['critical care', 'hemodynamic monitoring', 'charge nurse', 'ACLS protocols'],
   ARRAY['RN (IL)'], ARRAY['BLS', 'ACLS'], 'ADN, Harold Washington College', 'Direct outreach',
   0.890, '{"hard_qualification": 0.90, "experience_trajectory": 0.89, "skills_adjacency": 0.91, "engagement_propensity": 0.87}'::jsonb,
   'Maria has 6 years of adult ICU experience. All required credentials confirmed. Currently between positions — available immediately. Strong match.',
   'scheduled'),

  (v_c6_id, v_org_id, v_role1_id, 'James Rodriguez', 'james.rodriguez@example.com', '312-555-0106', 'ICU RN', 'St. Vincent Hospital', 'Indianapolis, IN', 4,
   ARRAY['critical care', 'ventilator management'],
   ARRAY['RN (IN)'], ARRAY['BLS'], 'BSN, Indiana University', 'LinkedIn',
   0.820, '{"hard_qualification": 0.72, "experience_trajectory": 0.83, "skills_adjacency": 0.84, "engagement_propensity": 0.78}'::jsonb,
   'James does not hold IL RN license. ACLS expired. Compensation expectation above range. Disqualified.',
   'archived'),

  (v_c7_id, v_org_id, v_role1_id, 'Robert Taylor', 'robert.taylor@example.com', '312-555-0107', 'ICU RN', 'University of Chicago Medical Center', 'Chicago, IL', 8,
   ARRAY['critical care', 'rapid response', 'preceptorship'],
   ARRAY['RN (IL)'], ARRAY['BLS', 'ACLS', 'CCRN'], NULL, 'LinkedIn',
   0.800, '{"hard_qualification": 0.88, "experience_trajectory": 0.91, "skills_adjacency": 0.82, "engagement_propensity": 0.55}'::jsonb,
   'Robert is highly qualified but indicated he is not currently looking for new opportunities.',
   'archived'),

  (v_c8_id, v_org_id, v_role1_id, 'Jennifer Wright', 'jennifer.wright@example.com', '312-555-0108', 'Charge Nurse — ICU', 'Advocate Christ Medical Center', 'Oak Lawn, IL', 8,
   ARRAY['leadership', 'ECMO', 'rapid response lead', 'Epic EMR', 'staff training'],
   ARRAY['RN (IL)', 'RN (WI)', 'RN (IN)'], ARRAY['BLS', 'ACLS', 'CCRN'], 'MSN, Chamberlain University', 'Professional network',
   0.960, '{"hard_qualification": 0.98, "experience_trajectory": 0.97, "skills_adjacency": 0.95, "engagement_propensity": 0.90}'::jsonb,
   'Jennifer exceeds all criteria. Multi-state RN, active CCRN since 2021, 8 years ICU including charge nurse. Leadership track candidate.',
   'voice_qualified'),

  (v_c9_id, v_org_id, v_role1_id, 'Michael Brown', 'michael.brown@example.com', '312-555-0109', 'ICU RN', 'Amita Health', 'Elk Grove Village, IL', 3,
   ARRAY['critical care', 'telemetry', 'Epic EMR'],
   ARRAY['RN (IL)'], ARRAY['BLS', 'ACLS'], 'BSN, Loyola University Chicago', 'LinkedIn',
   0.830, '{"hard_qualification": 0.84, "experience_trajectory": 0.81, "skills_adjacency": 0.83, "engagement_propensity": 0.82}'::jsonb,
   'Michael meets base requirements. 3 years ICU at Amita Health. All required credentials active. Solid candidate.',
   'scored'),

  (v_c10_id, v_org_id, v_role1_id, 'Lisa Thompson', 'lisa.thompson@example.com', '312-555-0110', 'ICU Float RN', 'NorthShore University HealthSystem', 'Evanston, IL', 5,
   ARRAY['multi-unit experience', 'critical care', 'Epic EMR', 'CRRT'],
   ARRAY['RN (IL)'], ARRAY['BLS', 'ACLS'], 'BSN, North Park University', 'Professional network',
   0.880, '{"hard_qualification": 0.89, "experience_trajectory": 0.86, "skills_adjacency": 0.90, "engagement_propensity": 0.85}'::jsonb,
   'Lisa has strong float ICU experience across multiple units at NorthShore. Active credentials. High adaptability indicator.',
   'engaged'),

  (v_c11_id, v_org_id, v_role1_id, 'Kevin Nguyen', 'kevin.nguyen@example.com', '312-555-0111', 'Med-Surg RN', 'Presence Health', 'Chicago, IL', 2,
   ARRAY['patient care', 'medication administration', 'Epic EMR'],
   ARRAY['RN (IL)'], ARRAY['BLS'], 'BSN, DePaul University', 'LinkedIn',
   0.760, '{"hard_qualification": 0.71, "experience_trajectory": 0.74, "skills_adjacency": 0.76, "engagement_propensity": 0.80}'::jsonb,
   'Kevin lacks ICU-specific experience and ACLS certification. Med-Surg background does not meet the ICU experience requirement.',
   'discovered'),

  (v_c12_id, v_org_id, v_role1_id, 'Amanda Foster', 'amanda.foster@example.com', '312-555-0112', 'ICU RN', 'Loyola University Medical Center', 'Maywood, IL', 4,
   ARRAY['critical care', 'cardiac surgery recovery', 'IABP management'],
   ARRAY['RN (IL)'], ARRAY['BLS', 'ACLS', 'CCRN'], 'BSN, Marquette University', 'Professional network',
   0.840, '{"hard_qualification": 0.86, "experience_trajectory": 0.83, "skills_adjacency": 0.87, "engagement_propensity": 0.81}'::jsonb,
   'Amanda has specialty cardiac ICU experience. All required credentials and CCRN certification active. Strong clinical background.',
   'scored'),

  (v_c13_id, v_org_id, v_role1_id, 'Christopher Lee', 'christopher.lee@example.com', '312-555-0113', 'Step-Down Unit RN', 'Rush Oak Park Hospital', 'Oak Park, IL', 3,
   ARRAY['telemetry', 'step-down care', 'Epic EMR'],
   ARRAY['RN (IL)'], ARRAY['BLS', 'ACLS'], 'BSN, Rush University', 'LinkedIn',
   0.790, '{"hard_qualification": 0.78, "experience_trajectory": 0.79, "skills_adjacency": 0.80, "engagement_propensity": 0.82}'::jsonb,
   'Christopher has step-down experience adjacent to ICU. Credentials active. ICU-specific experience not confirmed.',
   'discovered'),

  (v_c14_id, v_org_id, v_role1_id, 'Rachel Martinez', 'rachel.martinez@example.com', '312-555-0114', 'ICU RN', 'Stroger Hospital of Cook County', 'Chicago, IL', 6,
   ARRAY['trauma care', 'critical care', 'rapid response'],
   ARRAY['RN (IL)'], ARRAY['BLS', 'ACLS'], 'BSN, University of Illinois Chicago', 'Professional network',
   0.860, '{"hard_qualification": 0.87, "experience_trajectory": 0.86, "skills_adjacency": 0.86, "engagement_propensity": 0.84}'::jsonb,
   'Rachel has strong trauma and critical care background at a major county hospital. 6 years experience. All required credentials active.',
   'engaged'),

  (v_c15_id, v_org_id, v_role1_id, 'Daniel Harris', 'daniel.harris@example.com', '312-555-0115', 'ER RN', 'Advocate Lutheran General', 'Park Ridge, IL', 7,
   ARRAY['emergency care', 'triage', 'trauma protocols'],
   ARRAY['RN (IL)'], ARRAY['BLS', 'ACLS'], 'BSN, Northwestern University', 'LinkedIn',
   0.710, '{"hard_qualification": 0.68, "experience_trajectory": 0.85, "skills_adjacency": 0.70, "engagement_propensity": 0.74}'::jsonb,
   'Daniel has ER experience but lacks ICU-specific background. Emergency nursing skills have some adjacency but ICU qualification requirement not met.',
   'archived'),

  (v_c16_id, v_org_id, v_role1_id, 'Emily Watson', 'emily.watson@example.com', '312-555-0116', 'CVICU RN', 'Northwestern Memorial Hospital', 'Chicago, IL', 4,
   ARRAY['cardiovascular critical care', 'IABP', 'VAD management', 'Epic EMR'],
   ARRAY['RN (IL)'], ARRAY['BLS', 'ACLS', 'CCRN'], 'BSN, DePaul University', 'Professional network',
   0.880, '{"hard_qualification": 0.90, "experience_trajectory": 0.85, "skills_adjacency": 0.89, "engagement_propensity": 0.86}'::jsonb,
   'Emily has specialized CVICU experience at Northwestern. CCRN active. Cardiovascular critical care expertise is a strong match.',
   'responded'),

  (v_c17_id, v_org_id, v_role1_id, 'Jason Park', 'jason.park@example.com', '312-555-0117', 'ICU RN', 'Swedish Covenant Hospital', 'Chicago, IL', 2,
   ARRAY['critical care', 'patient assessment', 'Epic EMR'],
   ARRAY['RN (IL)'], ARRAY['BLS', 'ACLS'], 'BSN, Concordia University', 'LinkedIn',
   0.770, '{"hard_qualification": 0.77, "experience_trajectory": 0.75, "skills_adjacency": 0.78, "engagement_propensity": 0.80}'::jsonb,
   'Jason is at the minimum experience threshold. 2 years ICU at a community hospital. All credentials active but limited scope of practice.',
   'scored'),

  (v_c18_id, v_org_id, v_role1_id, 'Stephanie Adams', 'stephanie.adams@example.com', '312-555-0118', 'ICU RN — Night Shift', 'Mercy Hospital', 'Chicago, IL', 5,
   ARRAY['critical care', 'night shift experience', 'Epic EMR', 'rapid response'],
   ARRAY['RN (IL)'], ARRAY['BLS', 'ACLS'], 'BSN, Loyola University Chicago', 'Professional network',
   0.850, '{"hard_qualification": 0.86, "experience_trajectory": 0.84, "skills_adjacency": 0.86, "engagement_propensity": 0.84}'::jsonb,
   'Stephanie has 5 years ICU experience including extensive night shift. All required credentials active. Shift flexibility noted.',
   'voice_qualified'),

  (v_c19_id, v_org_id, v_role1_id, 'Brandon Miller', 'brandon.miller@example.com', '312-555-0119', 'Telemetry RN', 'Weiss Memorial Hospital', 'Chicago, IL', 3,
   ARRAY['cardiac monitoring', 'telemetry', 'Epic EMR'],
   ARRAY['RN (IL)'], ARRAY['BLS'], 'ASN, Wilbur Wright College', 'LinkedIn',
   0.730, '{"hard_qualification": 0.70, "experience_trajectory": 0.73, "skills_adjacency": 0.74, "engagement_propensity": 0.78}'::jsonb,
   'Brandon lacks ICU experience and ACLS certification. Telemetry background has limited ICU adjacency.',
   'discovered'),

  (v_c20_id, v_org_id, v_role1_id, 'Nicole Jackson', 'nicole.jackson@example.com', '312-555-0120', 'ICU Travel RN', 'Currently at Advocate Christ', 'Chicago, IL', 6,
   ARRAY['multi-facility experience', 'rapid adaptation', 'critical care', 'Epic EMR', 'Cerner'],
   ARRAY['RN (IL)', 'RN (CA)', 'RN (TX)'], ARRAY['BLS', 'ACLS', 'CCRN'], 'BSN, University of Illinois Chicago', 'Professional network',
   0.900, '{"hard_qualification": 0.92, "experience_trajectory": 0.90, "skills_adjacency": 0.91, "engagement_propensity": 0.88}'::jsonb,
   'Nicole has extensive travel nursing experience across multiple states. Multi-state licenses, CCRN active. High adaptability and broad ICU exposure.',
   'engaged');

INSERT INTO candidates (id, org_id, role_id, full_name, email, phone, current_title, current_company, location, experience_years, skills, licenses, certifications, education, source, score, score_breakdown, score_rationale, pipeline_stage)
VALUES
  (v_np1_id, v_org_id, v_role2_id, 'Dr. Angela Martinez', 'angela.martinez@example.com', '415-555-0201', 'Family Nurse Practitioner', 'One Medical', 'San Francisco, CA', 8,
   ARRAY['primary care', 'chronic disease management', 'preventive medicine', 'telehealth'],
   ARRAY['NP License (CA)'], ARRAY['DEA Registration', 'BLS'], 'MSN-FNP, UCSF', 'Professional network',
   0.930, '{"hard_qualification": 0.95, "experience_trajectory": 0.92, "skills_adjacency": 0.93, "engagement_propensity": 0.88}'::jsonb,
   'Angela has extensive primary care NP experience at a tech-forward practice. DEA registration active. Telehealth experience is a strong differentiator.',
   'voice_qualified'),

  (v_np2_id, v_org_id, v_role2_id, 'Patricia Okonkwo', 'patricia.okonkwo@example.com', '214-555-0202', 'Adult-Gerontology NP', 'UT Southwestern', 'Dallas, TX', 5,
   ARRAY['geriatric care', 'chronic disease', 'care coordination', 'Epic EMR'],
   ARRAY['NP License (TX)'], ARRAY['DEA Registration', 'BLS'], 'DNP, Texas Woman''s University', 'LinkedIn',
   0.890, '{"hard_qualification": 0.91, "experience_trajectory": 0.87, "skills_adjacency": 0.90, "engagement_propensity": 0.89}'::jsonb,
   'Patricia holds DNP (exceeds requirement) and active DEA. 5 years primary care with geriatric specialization. Strong clinical background.',
   'scored'),

  (v_np3_id, v_org_id, v_role2_id, 'Carlos Rivera', 'carlos.rivera@example.com', '305-555-0203', 'FNP — Bilingual', 'Federally Qualified Health Center', 'Miami, FL', 6,
   ARRAY['primary care', 'bilingual Spanish/English', 'underserved populations', 'chronic disease'],
   ARRAY['NP License (FL)'], ARRAY['DEA Registration', 'BLS'], 'MSN, University of Miami', 'Professional network',
   0.920, '{"hard_qualification": 0.93, "experience_trajectory": 0.90, "skills_adjacency": 0.95, "engagement_propensity": 0.90}'::jsonb,
   'Carlos meets all requirements and exceeds nice-to-haves with bilingual Spanish fluency. Strong FQHC experience serving diverse populations.',
   'voice_qualified'),

  (v_np4_id, v_org_id, v_role2_id, 'Sandra Kim', 'sandra.kim@example.com', '206-555-0204', 'Pediatric NP', 'Seattle Children''s', 'Seattle, WA', 4,
   ARRAY['pediatric primary care', 'well-child visits', 'developmental screening'],
   ARRAY['NP License (WA)'], ARRAY['DEA Registration', 'BLS', 'PALS'], 'MSN, University of Washington', 'LinkedIn',
   0.780, '{"hard_qualification": 0.75, "experience_trajectory": 0.80, "skills_adjacency": 0.78, "engagement_propensity": 0.82}'::jsonb,
   'Sandra has pediatric NP focus which partially overlaps primary care. DEA active. May need adult care competency validation.',
   'scored'),

  (v_np5_id, v_org_id, v_role2_id, 'Michael Torres', 'michael.torres@example.com', '602-555-0205', 'FNP — Rural Health', 'Arizona Rural Health Clinic', 'Phoenix, AZ', 7,
   ARRAY['rural health', 'primary care', 'chronic disease management', 'telehealth'],
   ARRAY['NP License (AZ)'], ARRAY['DEA Registration', 'BLS'], 'MSN-FNP, Arizona State University', 'Professional network',
   0.870, '{"hard_qualification": 0.88, "experience_trajectory": 0.85, "skills_adjacency": 0.87, "engagement_propensity": 0.87}'::jsonb,
   'Michael has strong rural health and telehealth experience. All credentials active. Remote role is well-aligned with his background.',
   'engaged'),

  (v_np6_id, v_org_id, v_role2_id, 'Rachel Green', 'rachel.green@example.com', '617-555-0206', 'FNP', 'Mass General Brigham', 'Boston, MA', 3,
   ARRAY['primary care', 'preventive medicine', 'EPIC'],
   ARRAY['NP License (MA)'], ARRAY['DEA Registration', 'BLS'], 'MSN, Boston College', 'LinkedIn',
   0.820, '{"hard_qualification": 0.83, "experience_trajectory": 0.80, "skills_adjacency": 0.83, "engagement_propensity": 0.84}'::jsonb,
   'Rachel meets minimum experience requirement. MGB provides strong clinical training background. All credentials active.',
   'discovered'),

  (v_np7_id, v_org_id, v_role2_id, 'James Chen', 'james.chen@example.com', '323-555-0207', 'FNP — Independent Practice', 'Private Practice', 'Los Angeles, CA', 9,
   ARRAY['independent practice', 'primary care', 'chronic disease', 'telehealth', 'practice management'],
   ARRAY['NP License (CA)'], ARRAY['DEA Registration', 'BLS'], 'DNP, UCLA', 'Professional network',
   0.900, '{"hard_qualification": 0.93, "experience_trajectory": 0.93, "skills_adjacency": 0.90, "engagement_propensity": 0.85}'::jsonb,
   'James has DNP and runs an independent practice. Highest autonomy experience. Strong clinical and administrative background.',
   'voice_qualified'),

  (v_np8_id, v_org_id, v_role2_id, 'Maria Santos', 'maria.santos@example.com', '312-555-0208', 'FNP', 'Erie Family Health Centers', 'Chicago, IL', 5,
   ARRAY['community health', 'primary care', 'bilingual Spanish', 'health equity'],
   ARRAY['NP License (IL)'], ARRAY['DEA Registration', 'BLS'], 'MSN, Loyola University Chicago', 'Direct outreach',
   0.880, '{"hard_qualification": 0.89, "experience_trajectory": 0.85, "skills_adjacency": 0.90, "engagement_propensity": 0.88}'::jsonb,
   'Maria has community health NP experience in Chicago. Bilingual. All credentials active. Strong alignment with healthcare mission.',
   'responded'),

  (v_np9_id, v_org_id, v_role2_id, 'Thomas Brown', 'thomas.brown@example.com', '404-555-0209', 'FNP', 'Grady Health System', 'Atlanta, GA', 4,
   ARRAY['primary care', 'chronic disease', 'urgent care crossover'],
   ARRAY['NP License (GA)'], ARRAY['DEA Registration', 'BLS'], 'MSN, Emory University', 'LinkedIn',
   0.800, '{"hard_qualification": 0.81, "experience_trajectory": 0.79, "skills_adjacency": 0.81, "engagement_propensity": 0.82}'::jsonb,
   'Thomas has solid primary care background at a major academic health system. All credentials active.',
   'discovered'),

  (v_np10_id, v_org_id, v_role2_id, 'Jennifer Walsh', 'jennifer.walsh@example.com', '614-555-0210', 'FNP — Occupational Health', 'OhioHealth', 'Columbus, OH', 6,
   ARRAY['occupational health', 'primary care', 'workplace injury'],
   ARRAY['NP License (OH)'], ARRAY['DEA Registration', 'BLS'], 'MSN, Ohio State University', 'LinkedIn',
   0.760, '{"hard_qualification": 0.74, "experience_trajectory": 0.78, "skills_adjacency": 0.76, "engagement_propensity": 0.76}'::jsonb,
   'Jennifer''s occupational health focus has limited primary care overlap. DEA active but practice area mismatch.',
   'archived'),

  (v_np11_id, v_org_id, v_role2_id, 'David Park', 'david.park@example.com', '503-555-0211', 'FNP', 'Oregon Health & Science University', 'Portland, OR', 7,
   ARRAY['primary care', 'integrative medicine', 'chronic pain', 'telehealth'],
   ARRAY['NP License (OR)'], ARRAY['DEA Registration', 'BLS'], 'MSN, OHSU', 'Professional network',
   0.850, '{"hard_qualification": 0.86, "experience_trajectory": 0.84, "skills_adjacency": 0.86, "engagement_propensity": 0.84}'::jsonb,
   'David has strong primary care foundation with telehealth experience. Integrative medicine background adds differentiation.',
   'scored'),

  (v_np12_id, v_org_id, v_role2_id, 'Aisha Johnson', 'aisha.johnson@example.com', '832-555-0212', 'FNP — Internal Medicine', 'Houston Methodist', 'Houston, TX', 5,
   ARRAY['internal medicine', 'primary care', 'complex chronic disease', 'Epic EMR'],
   ARRAY['NP License (TX)'], ARRAY['DEA Registration', 'BLS'], 'MSN-FNP, Texas Southern University', 'LinkedIn',
   0.860, '{"hard_qualification": 0.87, "experience_trajectory": 0.84, "skills_adjacency": 0.87, "engagement_propensity": 0.86}'::jsonb,
   'Aisha has internal medicine NP experience at a major academic system. Strong chronic disease management skills.',
   'engaged');

INSERT INTO candidates (id, org_id, role_id, full_name, email, phone, current_title, current_company, location, experience_years, skills, licenses, certifications, education, source, score, score_breakdown, score_rationale, pipeline_stage)
VALUES
  (v_e1_id, v_org_id, v_role3_id, 'Alex Reeves', 'alex.reeves@example.com', '512-555-0301', 'Senior Software Engineer', 'Stripe', 'Austin, TX', 7,
   ARRAY['Python', 'TypeScript', 'AWS', 'distributed systems', 'system design'],
   ARRAY[]::TEXT[], ARRAY[]::TEXT[], 'BS Computer Science, UT Austin', 'LinkedIn',
   0.920, '{"hard_qualification": 0.94, "experience_trajectory": 0.91, "skills_adjacency": 0.93, "engagement_propensity": 0.89}'::jsonb,
   'Alex meets all hard requirements. 7 years at Stripe covering TypeScript, Python, and large-scale distributed systems. Strong system design experience.',
   'voice_qualified'),

  (v_e2_id, v_org_id, v_role3_id, 'Jordan Williams', 'jordan.williams@example.com', '512-555-0302', 'Staff Engineer', 'Indeed', 'Austin, TX', 10,
   ARRAY['Python', 'TypeScript', 'GCP', 'Kubernetes', 'ML infrastructure'],
   ARRAY[]::TEXT[], ARRAY[]::TEXT[], 'MS Computer Science, Georgia Tech', 'Professional network',
   0.890, '{"hard_qualification": 0.91, "experience_trajectory": 0.93, "skills_adjacency": 0.88, "engagement_propensity": 0.84}'::jsonb,
   'Jordan has strong backend platform engineering experience. ML infrastructure background is a strong nice-to-have match.',
   'scored'),

  (v_e3_id, v_org_id, v_role3_id, 'Sam Patel', 'sam.patel@example.com', '512-555-0303', 'Senior Backend Engineer', 'Tesla', 'Austin, TX', 6,
   ARRAY['Python', 'TypeScript', 'Azure', 'microservices', 'API design'],
   ARRAY[]::TEXT[], ARRAY[]::TEXT[], 'BS Computer Science, Stanford', 'LinkedIn',
   0.860, '{"hard_qualification": 0.87, "experience_trajectory": 0.85, "skills_adjacency": 0.87, "engagement_propensity": 0.86}'::jsonb,
   'Sam has strong full-stack backend experience. Tesla infrastructure work demonstrates cloud and systems competency.',
   'engaged'),

  (v_e4_id, v_org_id, v_role3_id, 'Morgan Chen', 'morgan.chen@example.com', '415-555-0304', 'Senior SWE — Health Tech', 'Epic Systems', 'Remote', 8,
   ARRAY['Python', 'TypeScript', 'healthcare interoperability', 'HL7 FHIR', 'cloud infrastructure'],
   ARRAY[]::TEXT[], ARRAY[]::TEXT[], 'BS Software Engineering, Carnegie Mellon', 'Professional network',
   0.910, '{"hard_qualification": 0.93, "experience_trajectory": 0.89, "skills_adjacency": 0.94, "engagement_propensity": 0.91}'::jsonb,
   'Morgan has both technical requirements and healthcare domain experience — rare combination. Epic background provides direct domain relevance.',
   'voice_qualified'),

  (v_e5_id, v_org_id, v_role3_id, 'Casey Rodriguez', 'casey.rodriguez@example.com', '737-555-0305', 'Senior Engineer — Platform', 'Dell Technologies', 'Austin, TX', 9,
   ARRAY['Python', 'Java', 'AWS', 'system design', 'platform engineering'],
   ARRAY[]::TEXT[], ARRAY[]::TEXT[], 'MS Software Engineering, UT Austin', 'LinkedIn',
   0.840, '{"hard_qualification": 0.85, "experience_trajectory": 0.87, "skills_adjacency": 0.83, "engagement_propensity": 0.81}'::jsonb,
   'Casey has strong platform engineering background. Java-heavy background but Python and AWS competency confirmed.',
   'scored'),

  (v_e6_id, v_org_id, v_role3_id, 'Riley Thompson', 'riley.thompson@example.com', '512-555-0306', 'Full Stack Engineer', 'Healthcare Startup', 'Austin, TX', 5,
   ARRAY['TypeScript', 'React', 'Python', 'AWS', 'startup experience'],
   ARRAY[]::TEXT[], ARRAY[]::TEXT[], 'BS Computer Science, Rice University', 'Professional network',
   0.820, '{"hard_qualification": 0.83, "experience_trajectory": 0.80, "skills_adjacency": 0.82, "engagement_propensity": 0.85}'::jsonb,
   'Riley has relevant stack and healthcare domain experience. 5 years is at minimum. Startup background shows adaptability.',
   'responded'),

  (v_e7_id, v_org_id, v_role3_id, 'Drew Kim', 'drew.kim@example.com', '512-555-0307', 'Senior Data Engineer', 'H-E-B', 'Austin, TX', 6,
   ARRAY['Python', 'SQL', 'data pipelines', 'Spark', 'AWS'],
   ARRAY[]::TEXT[], ARRAY[]::TEXT[], 'BS Computer Science, Texas A&M', 'LinkedIn',
   0.750, '{"hard_qualification": 0.73, "experience_trajectory": 0.76, "skills_adjacency": 0.75, "engagement_propensity": 0.80}'::jsonb,
   'Drew''s data engineering background has partial overlap. TypeScript and system design experience not confirmed. Primarily data-focused.',
   'discovered'),

  (v_e8_id, v_org_id, v_role3_id, 'Taylor Moore', 'taylor.moore@example.com', '512-555-0308', 'Senior Software Engineer — AI/ML', 'IBM', 'Austin, TX', 7,
   ARRAY['Python', 'TypeScript', 'ML infrastructure', 'cloud AI', 'LLM orchestration'],
   ARRAY[]::TEXT[], ARRAY[]::TEXT[], 'MS Computer Science, Johns Hopkins', 'Professional network',
   0.870, '{"hard_qualification": 0.88, "experience_trajectory": 0.86, "skills_adjacency": 0.90, "engagement_propensity": 0.84}'::jsonb,
   'Taylor has strong ML/AI infrastructure background which is a high-value nice-to-have. All hard requirements met. LLM experience directly relevant.',
   'archived');

INSERT INTO voice_calls (id, candidate_id, role_id, org_id, status, call_type, attempt_number, duration_seconds, started_at, completed_at, provider, qualification_status, call_summary, escalated, extracted_data)
VALUES
  (v_call1_id, v_c1_id, v_role1_id, v_org_id, 'completed', 'outbound', 1, 272, 
   '2025-03-14 14:14:00-05', '2025-03-14 14:18:32-05', 'vapi', 'qualified',
   'Sarah confirmed all required credentials are active. Available April 1 with 2-week notice. Comp aligned ($85-90K). Strong interest. Interview requested.',
   false,
   '{"credentials": {"rn_license_il": {"status": "confirmed", "detail": "Active through 2026"}, "bls": {"status": "confirmed", "detail": "Current"}, "acls": {"status": "confirmed", "detail": "Current"}, "ccrn": {"status": "confirmed", "detail": "Active"}}, "availability": {"start_date": "2025-04-01", "shift_preference": "Days, open to rotating", "notice_period": "2 weeks", "constraints": "None"}, "compensation": {"expectation": "85000-90000", "alignment": "within_range"}, "interest_level": "high", "interview_requested": true}'::jsonb),

  (v_call2_id, v_c6_id, v_role1_id, v_org_id, 'completed', 'outbound', 1, 187,
   '2025-03-14 15:22:00-05', '2025-03-14 15:25:07-05', 'vapi', 'disqualified',
   'James holds IN license not IL. ACLS expired 3 months ago. Compensation expectation $98K above range. Disqualified on three criteria.',
   false,
   '{"credentials": {"rn_license_il": {"status": "unverified", "detail": "License in Indiana, not Illinois"}, "bls": {"status": "confirmed"}, "acls": {"status": "expired", "detail": "Expired 3 months ago"}, "ccrn": {"status": "not_held"}}, "availability": {"start_date": "2025-05-15", "shift_preference": "Nights only", "notice_period": "4 weeks"}, "compensation": {"expectation": "98000", "alignment": "above_range"}, "interest_level": "moderate"}'::jsonb),

  (v_call3_id, v_c3_id, v_role1_id, v_org_id, 'completed', 'outbound', 1, 341,
   '2025-03-14 16:05:00-05', '2025-03-14 16:10:41-05', 'vapi', 'needs_review',
   'Priya confirmed RN (IL), BLS, CCRN. ACLS unclear — renewal in progress, completion date unconfirmed. Flagged for human review.',
   true,
   '{"credentials": {"rn_license_il": {"status": "confirmed", "detail": "Active through 2027"}, "bls": {"status": "confirmed"}, "acls": {"status": "unclear", "detail": "Renewal in progress, expected completion unknown"}, "ccrn": {"status": "confirmed", "detail": "Active"}}, "availability": {"start_date": "2025-04-15", "shift_preference": "Days preferred", "notice_period": "3 weeks"}, "compensation": {"expectation": "82000-88000", "alignment": "within_range"}, "interest_level": "high"}'::jsonb),

  (v_call4_id, v_c4_id, v_role1_id, v_org_id, 'no_answer', 'outbound', 1, NULL,
   '2025-03-15 10:30:00-05', NULL, 'vapi', NULL,
   'First attempt — no answer. Voicemail left. Retry scheduled.',
   false, NULL),

  (v_call5_id, v_c5_id, v_role1_id, v_org_id, 'completed', 'inbound', 2, 298,
   '2025-03-15 14:22:00-05', '2025-03-15 14:27:18-05', 'vapi', 'qualified',
   'Maria called back. All credentials confirmed. Currently between positions. Available March 31 or sooner. Compensation aligned $78-82K. Qualified.',
   false,
   '{"credentials": {"rn_license_il": {"status": "confirmed", "detail": "Active through 2026"}, "bls": {"status": "confirmed"}, "acls": {"status": "confirmed", "detail": "Current"}, "ccrn": {"status": "not_held"}}, "availability": {"start_date": "2025-03-31", "shift_preference": "Open to all shifts", "notice_period": "Immediately available", "constraints": "None"}, "compensation": {"expectation": "78000-82000", "alignment": "within_range"}, "interest_level": "high", "interview_requested": true}'::jsonb),

  (v_call6_id, v_c7_id, v_role1_id, v_org_id, 'completed', 'outbound', 1, 34,
   '2025-03-15 11:15:00-05', '2025-03-15 11:15:34-05', 'vapi', 'declined',
   'Robert declined — not currently looking for new opportunities. Opt-out respected. Marked as not available.',
   false,
   '{"interest_level": "none", "decline_reason": "Not currently looking for new positions"}'::jsonb),

  (v_call7_id, v_c8_id, v_role1_id, v_org_id, 'completed', 'outbound', 1, 412,
   '2025-03-15 13:45:00-05', '2025-03-15 13:51:52-05', 'vapi', 'qualified',
   'Jennifer exceeds all criteria. Multi-state licenses, CCRN since 2021, charge nurse. Interested in leadership track. Auto-escalated per high-value candidate rule.',
   true,
   '{"credentials": {"rn_license_il": {"status": "confirmed", "detail": "Active through 2027"}, "rn_license_wi": {"status": "confirmed"}, "rn_license_in": {"status": "confirmed"}, "bls": {"status": "confirmed"}, "acls": {"status": "confirmed"}, "ccrn": {"status": "confirmed", "detail": "Active since 2021"}}, "availability": {"start_date": "2025-04-01", "shift_preference": "Days, leadership role preferred", "notice_period": "3 weeks"}, "compensation": {"expectation": "92000-95000", "alignment": "within_range"}, "interest_level": "high", "leadership_interest": true, "interview_requested": true}'::jsonb),

  (v_call8_id, v_c9_id, v_role1_id, v_org_id, 'in_progress', 'outbound', 1, NULL,
   NOW() - INTERVAL '5 minutes', NULL, 'vapi', NULL,
   NULL, false, NULL);

UPDATE voice_calls SET escalation_reason = 'Ambiguous credential status: ACLS renewal in progress, completion unconfirmed' WHERE id = v_call3_id;
UPDATE voice_calls SET escalation_reason = 'High-value candidate: score 0.96 exceeds high-score threshold of 0.92', escalated_to = 'hiring-manager@midwesthealth.com' WHERE id = v_call7_id;

INSERT INTO voice_transcripts (call_id, entries)
VALUES
(v_call1_id, '[
  {"timestamp": "00:00", "speaker": "voice_agent", "text": "Hi Sarah, this is an AI assistant calling on behalf of Midwest Health System regarding a Registered Nurse ICU opportunity in Chicago. This call is being recorded for quality and compliance purposes. Would you like to continue, or would you prefer to speak with a person?"},
  {"timestamp": "00:08", "speaker": "candidate", "text": "No, this is fine. Go ahead."},
  {"timestamp": "00:10", "speaker": "voice_agent", "text": "Great, thank you. I have a few questions to confirm your qualifications. Can you confirm that you hold an active registered nurse license in Illinois?"},
  {"timestamp": "00:16", "speaker": "candidate", "text": "Yes, my Illinois RN license is current. It renews next year."},
  {"timestamp": "00:20", "speaker": "voice_agent", "text": "Perfect. And are your BLS and ACLS certifications current?"},
  {"timestamp": "00:23", "speaker": "candidate", "text": "Both are current. I renewed my ACLS about four months ago."},
  {"timestamp": "00:28", "speaker": "voice_agent", "text": "Excellent. I also see you may hold a CCRN certification. Is that active?"},
  {"timestamp": "00:32", "speaker": "candidate", "text": "It is. I got my CCRN in 2022 and it is still active."},
  {"timestamp": "00:37", "speaker": "voice_agent", "text": "Great. Regarding availability, what would be your earliest possible start date?"},
  {"timestamp": "00:41", "speaker": "candidate", "text": "I would need to give two weeks notice, so probably April 1st."},
  {"timestamp": "00:48", "speaker": "voice_agent", "text": "And do you have a shift preference? This role has day and rotating options."},
  {"timestamp": "00:53", "speaker": "candidate", "text": "I prefer days but I am open to rotating if needed."},
  {"timestamp": "00:57", "speaker": "voice_agent", "text": "This role offers $75,000 to $95,000 annually. Does that align with your expectations?"},
  {"timestamp": "01:04", "speaker": "candidate", "text": "Yes, I was looking in the $85 to $90 range so that works."},
  {"timestamp": "01:10", "speaker": "voice_agent", "text": "Based on everything we discussed, you meet the qualifications. Would you like to schedule an interview?"},
  {"timestamp": "01:19", "speaker": "candidate", "text": "Yes, definitely."},
  {"timestamp": "01:23", "speaker": "voice_agent", "text": "Wonderful. Someone from the team will reach out to schedule. Anything else?"},
  {"timestamp": "01:31", "speaker": "candidate", "text": "No, I am good. Thank you."},
  {"timestamp": "01:34", "speaker": "voice_agent", "text": "Thank you Sarah. Have a great day."}
]'::jsonb),

(v_call2_id, '[
  {"timestamp": "00:00", "speaker": "voice_agent", "text": "Hi James, this is an AI assistant calling on behalf of Midwest Health System regarding a Registered Nurse ICU opportunity in Chicago. This call is being recorded for quality and compliance purposes. Would you like to continue?"},
  {"timestamp": "00:09", "speaker": "candidate", "text": "Sure, go ahead."},
  {"timestamp": "00:11", "speaker": "voice_agent", "text": "Thank you. First, can you confirm you hold an active registered nurse license in Illinois?"},
  {"timestamp": "00:17", "speaker": "candidate", "text": "I have an RN license but it is in Indiana. I live in Indianapolis."},
  {"timestamp": "00:23", "speaker": "voice_agent", "text": "I see. This role requires an active Illinois RN license. Do you have a multi-state compact license or an Illinois license?"},
  {"timestamp": "00:30", "speaker": "candidate", "text": "No, just Indiana. I have not looked into getting an Illinois license."},
  {"timestamp": "00:36", "speaker": "voice_agent", "text": "Understood. Are your BLS and ACLS certifications current?"},
  {"timestamp": "00:40", "speaker": "candidate", "text": "BLS is current. ACLS — honestly I think it expired a few months ago. I keep meaning to renew it."},
  {"timestamp": "00:48", "speaker": "voice_agent", "text": "And what are your compensation expectations for this role?"},
  {"timestamp": "00:52", "speaker": "candidate", "text": "I was thinking around $98,000. I know that might be on the high end."},
  {"timestamp": "00:58", "speaker": "voice_agent", "text": "This role is budgeted between $75,000 and $95,000. That would be a gap from your expectation."},
  {"timestamp": "01:05", "speaker": "candidate", "text": "Yeah, that is too much of a gap for me."},
  {"timestamp": "01:09", "speaker": "voice_agent", "text": "Understood. Based on what we have discussed — the Illinois license requirement, ACLS status, and compensation alignment — this role may not be the right fit at this time. I will note that in your profile. Thank you for your time, James."},
  {"timestamp": "01:20", "speaker": "candidate", "text": "No problem. Thanks."}
]'::jsonb),

(v_call3_id, '[
  {"timestamp": "00:00", "speaker": "voice_agent", "text": "Hi Priya, this is an AI assistant calling on behalf of Midwest Health System regarding a Registered Nurse ICU opportunity in Chicago. This call is being recorded for quality and compliance purposes. Would you like to continue, or would you prefer to speak with a person?"},
  {"timestamp": "00:09", "speaker": "candidate", "text": "AI is fine. Go ahead."},
  {"timestamp": "00:12", "speaker": "voice_agent", "text": "Great. Can you confirm you hold an active RN license in Illinois?"},
  {"timestamp": "00:16", "speaker": "candidate", "text": "Yes, my IL license is active through 2027."},
  {"timestamp": "00:20", "speaker": "voice_agent", "text": "And is your BLS certification current?"},
  {"timestamp": "00:23", "speaker": "candidate", "text": "BLS is current, yes."},
  {"timestamp": "00:25", "speaker": "voice_agent", "text": "What about ACLS — is that certification active?"},
  {"timestamp": "00:30", "speaker": "candidate", "text": "I am actually in the middle of renewing it right now. I completed the online portion but have not done the in-person skills check yet."},
  {"timestamp": "00:39", "speaker": "voice_agent", "text": "Do you have a scheduled date for the skills check?"},
  {"timestamp": "00:43", "speaker": "candidate", "text": "Not yet. I have been trying to find a class with availability. It has been harder than expected."},
  {"timestamp": "00:50", "speaker": "voice_agent", "text": "I understand. Do you hold a CCRN certification?"},
  {"timestamp": "00:54", "speaker": "candidate", "text": "Yes, my CCRN is active."},
  {"timestamp": "00:57", "speaker": "voice_agent", "text": "Regarding availability, when could you start if an offer were extended?"},
  {"timestamp": "01:03", "speaker": "candidate", "text": "Probably around April 15th. I would need to give three weeks notice."},
  {"timestamp": "01:09", "speaker": "voice_agent", "text": "And does the compensation range of $75,000 to $95,000 align with your expectations?"},
  {"timestamp": "01:16", "speaker": "candidate", "text": "Yes, I was thinking $82 to $88 thousand, so that is within range."},
  {"timestamp": "01:22", "speaker": "voice_agent", "text": "Thank you Priya. Your credentials look strong overall, but because the ACLS renewal status is not yet complete, I want to flag this for the hiring team to follow up with you directly. Someone will be in touch shortly."},
  {"timestamp": "01:34", "speaker": "candidate", "text": "That makes sense. I understand."},
  {"timestamp": "01:37", "speaker": "voice_agent", "text": "Thank you for your time today."}
]'::jsonb),

(v_call5_id, '[
  {"timestamp": "00:00", "speaker": "voice_agent", "text": "Hi, this is an AI assistant calling on behalf of Midwest Health System. I understand you were expecting a callback. Is this Maria Gonzalez?"},
  {"timestamp": "00:07", "speaker": "candidate", "text": "Yes, this is Maria. I called back because I missed the earlier call."},
  {"timestamp": "00:12", "speaker": "voice_agent", "text": "Great, thank you for calling back. I have a few quick questions about your qualifications for the ICU RN role. Is this a good time?"},
  {"timestamp": "00:19", "speaker": "candidate", "text": "Yes, go ahead."},
  {"timestamp": "00:21", "speaker": "voice_agent", "text": "Can you confirm your Illinois RN license is active?"},
  {"timestamp": "00:25", "speaker": "candidate", "text": "Yes, active through 2026."},
  {"timestamp": "00:28", "speaker": "voice_agent", "text": "And are BLS and ACLS both current?"},
  {"timestamp": "00:31", "speaker": "candidate", "text": "Both current. I just renewed ACLS last month actually."},
  {"timestamp": "00:36", "speaker": "voice_agent", "text": "Excellent. I see you are currently between positions. What is your availability like?"},
  {"timestamp": "00:41", "speaker": "candidate", "text": "I am available immediately. My last day at Advocate Illinois Masonic was actually two weeks ago, so I can start as soon as March 31st or even sooner."},
  {"timestamp": "00:52", "speaker": "voice_agent", "text": "That is great timing. Do you have a shift preference?"},
  {"timestamp": "00:56", "speaker": "candidate", "text": "I am open to all shifts at this point. I worked nights for a few years and days more recently so I am flexible."},
  {"timestamp": "01:04", "speaker": "voice_agent", "text": "And the role is budgeted between $75,000 and $95,000. Does that work for you?"},
  {"timestamp": "01:11", "speaker": "candidate", "text": "Yes, I was thinking $78 to $82 thousand so that is well within range."},
  {"timestamp": "01:17", "speaker": "voice_agent", "text": "Maria, based on everything you have shared, you meet all the qualifications for this role. Would you like to move forward with scheduling an interview?"},
  {"timestamp": "01:25", "speaker": "candidate", "text": "Absolutely, yes. I am very interested."},
  {"timestamp": "01:29", "speaker": "voice_agent", "text": "Wonderful. You will receive a scheduling link by email shortly. Thank you for your time today."},
  {"timestamp": "01:38", "speaker": "candidate", "text": "Thank you. Looking forward to it."}
]'::jsonb),

(v_call6_id, '[
  {"timestamp": "00:00", "speaker": "voice_agent", "text": "Hi Robert, this is an AI assistant calling on behalf of Midwest Health System regarding a Registered Nurse ICU opportunity. This call is being recorded. Would you like to continue?"},
  {"timestamp": "00:08", "speaker": "candidate", "text": "I appreciate the call but I am not currently looking for a new position. Please remove me from your list."},
  {"timestamp": "00:15", "speaker": "voice_agent", "text": "Absolutely, I will mark your profile as not available and you will not be contacted again. Thank you for letting us know, Robert. Have a great day."},
  {"timestamp": "00:24", "speaker": "candidate", "text": "Thank you."}
]'::jsonb),

(v_call7_id, '[
  {"timestamp": "00:00", "speaker": "voice_agent", "text": "Hi Jennifer, this is an AI assistant calling on behalf of Midwest Health System regarding a Registered Nurse ICU opportunity in Chicago. This call is being recorded for quality and compliance purposes. Would you like to continue, or would you prefer to speak with a person?"},
  {"timestamp": "00:09", "speaker": "candidate", "text": "AI is fine. I have a few minutes."},
  {"timestamp": "00:13", "speaker": "voice_agent", "text": "Great. Can you confirm you hold an active Illinois RN license?"},
  {"timestamp": "00:17", "speaker": "candidate", "text": "I have RN licenses in Illinois, Wisconsin, and Indiana. All active through 2027."},
  {"timestamp": "00:24", "speaker": "voice_agent", "text": "Excellent. Are your BLS and ACLS certifications current?"},
  {"timestamp": "00:28", "speaker": "candidate", "text": "Both current. ACLS renewed earlier this year."},
  {"timestamp": "00:32", "speaker": "voice_agent", "text": "And do you hold a CCRN certification?"},
  {"timestamp": "00:35", "speaker": "candidate", "text": "Yes, I have been CCRN certified since 2021."},
  {"timestamp": "00:39", "speaker": "voice_agent", "text": "I see you are currently in a charge nurse role. Are you open to continuing in a leadership capacity?"},
  {"timestamp": "00:45", "speaker": "candidate", "text": "Yes, actually that is important to me. I have been in charge for three years now and I want to continue growing in that direction. Management track would be ideal."},
  {"timestamp": "00:57", "speaker": "voice_agent", "text": "That is very helpful context. Regarding availability, when could you start?"},
  {"timestamp": "01:03", "speaker": "candidate", "text": "I would need to give three weeks notice. So early April realistically."},
  {"timestamp": "01:09", "speaker": "voice_agent", "text": "And does the compensation range of $75,000 to $95,000 align with your expectations?"},
  {"timestamp": "01:16", "speaker": "candidate", "text": "I was thinking $92 to $95 thousand given my charge experience and multi-state licenses. Is that within range?"},
  {"timestamp": "01:24", "speaker": "candidate", "text": "That is within our range, yes."},
  {"timestamp": "01:27", "speaker": "voice_agent", "text": "Based on your qualifications, Jennifer, you exceed all of the requirements for this role and your leadership experience is a strong differentiator. I am going to flag your profile for direct follow-up from the hiring team. Someone will be reaching out to you shortly."},
  {"timestamp": "01:41", "speaker": "candidate", "text": "Sounds great. I look forward to it."},
  {"timestamp": "01:44", "speaker": "voice_agent", "text": "Thank you for your time today, Jennifer. Have a wonderful day."}
]'::jsonb);

INSERT INTO voice_settings (role_id, enabled, score_threshold, calling_window_start, calling_window_end, max_attempts, retry_interval_hours, leave_voicemail, auto_advance_qualified, outreach_tone, verification_points, escalation_rules, escalation_email)
VALUES
  (v_role1_id, true, 0.75, '09:00', '19:00', 3, 8, true, false, 'conversational',
   '[{"label": "RN License IL", "question": "Can you confirm you hold an active registered nurse license in Illinois?", "required": true}, {"label": "BLS Certification", "question": "Is your BLS certification current?", "required": true}, {"label": "ACLS Certification", "question": "Is your ACLS certification current?", "required": true}, {"label": "CCRN Certification", "question": "Do you hold an active CCRN certification?", "required": false}]'::jsonb,
   '{"on_human_request": true, "on_ambiguous_credentials": true, "on_high_score": true, "high_score_threshold": 0.92, "on_all_calls": false}'::jsonb,
   'hiring-manager@midwesthealth.com'),
  (v_role2_id, false, 0.75, '09:00', '18:00', 2, 12, true, false, 'professional',
   '[{"label": "NP License", "question": "Can you confirm your nurse practitioner license is active?", "required": true}, {"label": "DEA Registration", "question": "Do you hold an active DEA registration?", "required": true}]'::jsonb,
   '{"on_human_request": true, "on_ambiguous_credentials": true, "on_high_score": false, "high_score_threshold": 0.92, "on_all_calls": false}'::jsonb,
   NULL),
  (v_role3_id, false, 0.70, '09:00', '17:00', 2, 24, false, false, 'conversational',
   '[]'::jsonb,
   '{"on_human_request": true, "on_ambiguous_credentials": false, "on_high_score": false, "high_score_threshold": 0.92, "on_all_calls": false}'::jsonb,
   NULL);

INSERT INTO agent_activity_log (org_id, role_id, candidate_id, agent_name, action, detail, created_at)
VALUES
  (v_org_id, v_role1_id, NULL, 'scout', 'Discovered 4 new candidates matching RN ICU criteria from 8 sources', 'Sources: LinkedIn, Doximity, Indeed, professional network, Vivian Health', NOW() - INTERVAL '72 hours'),
  (v_org_id, v_role2_id, NULL, 'scout', 'Discovered 3 NP candidates from professional network scan', 'Sources: Doximity, LinkedIn, specialty NP forums', NOW() - INTERVAL '71 hours'),
  (v_org_id, v_role1_id, v_c8_id, 'enrich', 'Enriched profile: Jennifer Wright — 4 sources merged, credentials extracted', 'Cross-referenced LinkedIn, Doximity, IDFPR license lookup', NOW() - INTERVAL '70 hours'),
  (v_org_id, v_role1_id, v_c1_id, 'enrich', 'Enriched profile: Sarah Chen — 4 sources merged, credentials extracted', 'Education, employment history, license status verified', NOW() - INTERVAL '69 hours'),
  (v_org_id, v_role1_id, v_c2_id, 'enrich', 'Enriched profile: Marcus Williams — 3 sources merged', 'Employment history and certifications extracted', NOW() - INTERVAL '68 hours'),
  (v_org_id, v_role3_id, NULL, 'scout', 'Discovered 5 senior engineer candidates from tech talent sources', 'Sources: LinkedIn, GitHub, Stack Overflow Jobs', NOW() - INTERVAL '67 hours'),
  (v_org_id, v_role1_id, NULL, 'signal', 'Scored batch of 8 candidates for RN ICU — avg score 0.84', 'Top scorer: Jennifer Wright (0.96), lowest: Daniel Harris (0.71)', NOW() - INTERVAL '66 hours'),
  (v_org_id, v_role2_id, NULL, 'signal', 'Scored batch of 5 candidates for NP Primary Care — avg score 0.86', 'Top scorer: Angela Martinez (0.93)', NOW() - INTERVAL '65 hours'),
  (v_org_id, v_role3_id, NULL, 'signal', 'Scored batch of 5 candidates for Senior Engineer — avg score 0.87', 'Top scorer: Alex Reeves (0.92)', NOW() - INTERVAL '64 hours'),
  (v_org_id, v_role1_id, v_c1_id, 'voice', 'Completed qualification call with Sarah Chen — Qualified', 'Duration: 4m 32s. All credentials confirmed. Interview requested.', NOW() - INTERVAL '58 hours'),
  (v_org_id, v_role1_id, v_c6_id, 'voice', 'Completed qualification call with James Rodriguez — Disqualified', 'Duration: 3m 7s. IL license missing, ACLS expired, comp above range.', NOW() - INTERVAL '57 hours'),
  (v_org_id, v_role1_id, v_c3_id, 'voice', 'Completed qualification call with Priya Patel — Needs Review (ACLS unclear)', 'Duration: 5m 41s. Escalated: ACLS renewal in progress, date unconfirmed.', NOW() - INTERVAL '56 hours'),
  (v_org_id, v_role1_id, v_c4_id, 'voice', 'No answer: David Kim — voicemail left, retry scheduled in 8 hours', 'Attempt 1 of 3. Voicemail message delivered.', NOW() - INTERVAL '55 hours'),
  (v_org_id, v_role1_id, NULL, 'scout', 'Discovered 4 additional RN ICU candidates — second pass sourcing run', 'Expanded search to 12 sources, removed duplicates', NOW() - INTERVAL '54 hours'),
  (v_org_id, v_role1_id, v_c5_id, 'voice', 'Inbound callback: Maria Gonzalez — Qualified', 'Duration: 4m 58s. All credentials confirmed. Available immediately.', NOW() - INTERVAL '48 hours'),
  (v_org_id, v_role1_id, v_c7_id, 'voice', 'Completed call with Robert Taylor — Declined', 'Duration: 34s. Candidate not currently looking. Opted out.', NOW() - INTERVAL '47 hours'),
  (v_org_id, v_role1_id, v_c8_id, 'voice', 'Completed call with Jennifer Wright — Qualified, auto-escalated (high-value)', 'Duration: 6m 52s. Score 0.96 exceeded threshold. Escalated to hiring team.', NOW() - INTERVAL '46 hours'),
  (v_org_id, v_role1_id, v_c10_id, 'engage', 'Generated outreach sequence for Lisa Thompson — email channel', 'Personalized message based on float ICU experience, 3-touch sequence', NOW() - INTERVAL '45 hours'),
  (v_org_id, v_role1_id, v_c20_id, 'engage', 'Sent outreach to Nicole Jackson — email channel', 'Initial contact sent. Follow-up scheduled in 3 days.', NOW() - INTERVAL '44 hours'),
  (v_org_id, v_role2_id, v_np5_id, 'engage', 'Sent outreach to Michael Torres — email channel', 'Personalized message referencing telehealth and rural health background', NOW() - INTERVAL '43 hours'),
  (v_org_id, v_role1_id, v_c5_id, 'schedule', 'Interview confirmed: Maria Gonzalez — March 18, 2:00 PM CT', 'Calendar invites sent. Video call link included.', NOW() - INTERVAL '42 hours'),
  (v_org_id, v_role1_id, v_c14_id, 'engage', 'Rachel Martinez responded to outreach — positive reply received', 'Responded within 4 hours. Interest confirmed. Moving to voice queue.', NOW() - INTERVAL '40 hours'),
  (v_org_id, v_role2_id, v_np8_id, 'engage', 'Maria Santos responded to outreach — requested more information', 'Sent role details and benefits overview. Follow-up scheduled.', NOW() - INTERVAL '38 hours'),
  (v_org_id, v_role1_id, NULL, 'cortex', 'Ingested 8 feedback signals for RN ICU pipeline', 'Positive signals on CCRN certification and multi-state licenses', NOW() - INTERVAL '36 hours'),
  (v_org_id, v_role1_id, NULL, 'cortex', 'Adjusted scoring: increased weight on CCRN certification based on positive feedback patterns', 'CCRN weight increased from 0.8x to 1.2x multiplier in skills_adjacency', NOW() - INTERVAL '35 hours'),
  (v_org_id, v_role2_id, NULL, 'scout', 'Discovered 4 more NP candidates — specialty search expansion', 'Searched family medicine, internal medicine, and geriatrics NP profiles', NOW() - INTERVAL '34 hours'),
  (v_org_id, v_role1_id, v_c16_id, 'engage', 'Emily Watson responded to outreach — interested and available for call', 'Positive reply. Moved to voice queue.', NOW() - INTERVAL '32 hours'),
  (v_org_id, v_role3_id, v_e3_id, 'engage', 'Generated outreach for Sam Patel — LinkedIn channel', 'Personalized based on Tesla infrastructure and TypeScript experience', NOW() - INTERVAL '30 hours'),
  (v_org_id, v_role3_id, v_e6_id, 'engage', 'Riley Thompson responded to outreach — positive interest', 'Responded via email. Healthcare startup background resonated.', NOW() - INTERVAL '28 hours'),
  (v_org_id, v_role1_id, v_c9_id, 'voice', 'Initiated call with Michael Brown — in progress', 'Attempt 1 of 3. Call connected.', NOW() - INTERVAL '5 minutes'),
  (v_org_id, v_role2_id, v_np1_id, 'voice', 'Initiated qualification call with Angela Martinez', 'Score 0.93 exceeded threshold. Call initiated.', NOW() - INTERVAL '24 hours'),
  (v_org_id, v_role2_id, v_np1_id, 'voice', 'Completed qualification call with Angela Martinez — Qualified', 'All NP credentials confirmed. DEA active. Telehealth experience noted.', NOW() - INTERVAL '23 hours'),
  (v_org_id, v_role2_id, v_np3_id, 'voice', 'Completed qualification call with Carlos Rivera — Qualified', 'All credentials confirmed. Bilingual Spanish confirmed. Strong interest.', NOW() - INTERVAL '22 hours'),
  (v_org_id, v_role2_id, v_np7_id, 'voice', 'Completed qualification call with James Chen — Qualified', 'DNP, independent practice experience, DEA active. High-value candidate.', NOW() - INTERVAL '21 hours'),
  (v_org_id, v_role3_id, v_e1_id, 'voice', 'Completed qualification call with Alex Reeves — Qualified', 'All technical requirements confirmed. System design experience strong.', NOW() - INTERVAL '20 hours'),
  (v_org_id, v_role3_id, v_e4_id, 'voice', 'Completed qualification call with Morgan Chen — Qualified', 'Healthcare domain + technical stack confirmed. Epic background noted.', NOW() - INTERVAL '19 hours'),
  (v_org_id, v_role1_id, NULL, 'cortex', 'Pipeline health: RN ICU — 47 scored, 18 voice qualified, conversion rate 38%', 'Above-average conversion. Scheduling funnel performing well.', NOW() - INTERVAL '18 hours'),
  (v_org_id, v_role2_id, NULL, 'cortex', 'Pipeline health: NP Primary Care — 22 scored, 8 voice qualified, conversion rate 36%', 'Telehealth background emerging as key differentiator in top candidates', NOW() - INTERVAL '17 hours'),
  (v_org_id, v_role1_id, NULL, 'scout', 'Scout cycle complete for RN ICU — 20 total candidates sourced', 'Target: 50, Current: 20. Next sourcing run in 24 hours.', NOW() - INTERVAL '16 hours'),
  (v_org_id, v_role1_id, v_c12_id, 'enrich', 'Enriched profile: Amanda Foster — cardiac surgery ICU specialization noted', 'IABP management extracted from work history, CCRN confirmed', NOW() - INTERVAL '15 hours'),
  (v_org_id, v_role2_id, v_np11_id, 'enrich', 'Enriched profile: David Park — integrative medicine background noted', 'OHSU academic medical center, telehealth credentials confirmed', NOW() - INTERVAL '14 hours'),
  (v_org_id, v_role2_id, NULL, 'signal', 'Re-scored NP pipeline with updated weights — avg score shifted 0.02', 'Telehealth experience now weighted higher per Cortex recommendation', NOW() - INTERVAL '13 hours'),
  (v_org_id, v_role1_id, NULL, 'scout', 'Discovered 3 night-shift ICU RN candidates from shift-specific search', 'Targeted outreach to candidates with documented night shift preference', NOW() - INTERVAL '12 hours'),
  (v_org_id, v_role3_id, v_e8_id, 'signal', 'Flagged Taylor Moore for LLM/ML infrastructure relevance', 'LLM orchestration experience directly relevant to platform architecture', NOW() - INTERVAL '11 hours'),
  (v_org_id, v_role1_id, v_c18_id, 'voice', 'Completed call with Stephanie Adams — Qualified', 'All credentials confirmed. Night shift availability noted as flexible.', NOW() - INTERVAL '10 hours'),
  (v_org_id, v_role2_id, v_np12_id, 'engage', 'Sent outreach to Aisha Johnson — email and LinkedIn', 'Houston Methodist background referenced. Response pending.', NOW() - INTERVAL '9 hours'),
  (v_org_id, v_role1_id, NULL, 'cortex', 'Scoring model updated: charge nurse experience now positive signal', 'Based on Jennifer Wright escalation and hiring team feedback', NOW() - INTERVAL '8 hours'),
  (v_org_id, v_role3_id, v_e5_id, 'enrich', 'Enriched profile: Casey Rodriguez — platform engineering scope confirmed', 'Dell enterprise platform background verified across 3 sources', NOW() - INTERVAL '7 hours'),
  (v_org_id, v_role1_id, NULL, 'scout', 'Running sourcing expansion for RN ICU — targeting travel nurses', 'Vivian Health and travel nurse agencies being scanned', NOW() - INTERVAL '6 hours'),
  (v_org_id, v_role2_id, v_np6_id, 'scout', 'Discovered Rachel Green — Mass General Brigham FNP', 'Added to pipeline from Doximity professional network scan', NOW() - INTERVAL '4 hours'),
  (v_org_id, v_role1_id, NULL, 'cortex', 'Weekly pipeline summary generated — RN ICU role', '20 candidates, 8 voice calls, 3 qualified, 2 archived, 1 scheduled', NOW() - INTERVAL '2 hours');

END $$;
