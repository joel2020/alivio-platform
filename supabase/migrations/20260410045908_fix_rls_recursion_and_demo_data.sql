/*
  # Fix RLS Infinite Recursion and Demo Data Function

  ## Problem 1: Infinite Recursion in users RLS
  The policy "Users can read org members" queries the users table inside
  a policy on the users table, causing infinite recursion. Fix: use the
  SECURITY DEFINER get_user_org_id() function which bypasses RLS.

  ## Problem 2: load_demo_data column mismatches
  The function uses column names that don't exist in the actual schema:
  - roles: department, requirements, salary_min, salary_max (wrong)
  - candidates: linkedin_url, current_employer, years_experience, sourced_by (wrong)
  - voice_calls: extracted_credentials, extracted_availability, ai_confidence (wrong)
  - voice_transcripts: org_id, transcript (wrong)
  - voice_settings: org_id, persona_name, persona_voice, opening_script, qualification_questions (wrong)
  - qualification_status used 'not_qualified' which is not in the enum

  ## Changes
  1. Drop and recreate the recursive policy using get_user_org_id()
  2. Rewrite load_demo_data with correct column names matching the schema
*/

-- ─── FIX 1: RLS Infinite Recursion ────────────────────────────────────────────

DROP POLICY IF EXISTS "Users can read org members" ON users;

CREATE POLICY "Users can read org members"
  ON users FOR SELECT
  TO authenticated
  USING (org_id = get_user_org_id());

-- ─── FIX 2: Rewrite load_demo_data with correct column names ───────────────────

CREATE OR REPLACE FUNCTION load_demo_data(target_org_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role1_id UUID := gen_random_uuid();
  v_role2_id UUID := gen_random_uuid();
  v_role3_id UUID := gen_random_uuid();

  v_c1  UUID := gen_random_uuid(); v_c2  UUID := gen_random_uuid();
  v_c3  UUID := gen_random_uuid(); v_c4  UUID := gen_random_uuid();
  v_c5  UUID := gen_random_uuid(); v_c6  UUID := gen_random_uuid();
  v_c7  UUID := gen_random_uuid(); v_c8  UUID := gen_random_uuid();
  v_c9  UUID := gen_random_uuid(); v_c10 UUID := gen_random_uuid();
  v_c11 UUID := gen_random_uuid(); v_c12 UUID := gen_random_uuid();
  v_c13 UUID := gen_random_uuid(); v_c14 UUID := gen_random_uuid();
  v_c15 UUID := gen_random_uuid(); v_c16 UUID := gen_random_uuid();
  v_c17 UUID := gen_random_uuid(); v_c18 UUID := gen_random_uuid();
  v_c19 UUID := gen_random_uuid(); v_c20 UUID := gen_random_uuid();
  v_c21 UUID := gen_random_uuid(); v_c22 UUID := gen_random_uuid();
  v_c23 UUID := gen_random_uuid(); v_c24 UUID := gen_random_uuid();
  v_c25 UUID := gen_random_uuid(); v_c26 UUID := gen_random_uuid();
  v_c27 UUID := gen_random_uuid(); v_c28 UUID := gen_random_uuid();
  v_c29 UUID := gen_random_uuid(); v_c30 UUID := gen_random_uuid();
  v_c31 UUID := gen_random_uuid(); v_c32 UUID := gen_random_uuid();
  v_c33 UUID := gen_random_uuid(); v_c34 UUID := gen_random_uuid();
  v_c35 UUID := gen_random_uuid(); v_c36 UUID := gen_random_uuid();
  v_c37 UUID := gen_random_uuid(); v_c38 UUID := gen_random_uuid();
  v_c39 UUID := gen_random_uuid(); v_c40 UUID := gen_random_uuid();

  v_vc1 UUID := gen_random_uuid(); v_vc2 UUID := gen_random_uuid();
  v_vc3 UUID := gen_random_uuid(); v_vc4 UUID := gen_random_uuid();
  v_vc5 UUID := gen_random_uuid(); v_vc6 UUID := gen_random_uuid();
  v_vc7 UUID := gen_random_uuid(); v_vc8 UUID := gen_random_uuid();
BEGIN

  -- ─── ROLES ─────────────────────────────────────────────────────────────────
  INSERT INTO roles (id, org_id, title, location, employment_type, status, description, must_have_requirements, compensation_min, compensation_max, created_at)
  VALUES
    (v_role1_id, target_org_id, 'ICU Registered Nurse', 'Chicago, IL', 'full-time', 'active',
     'Seeking experienced ICU RN to join our Level I Trauma Center critical care team. Night shift openings available.',
     ARRAY['Active RN license', '2+ years ICU experience', 'BLS/ACLS certified'],
     72000, 95000, now() - interval '18 days'),

    (v_role2_id, target_org_id, 'Nurse Practitioner – Primary Care', 'Naperville, IL', 'full-time', 'active',
     'Join our growing outpatient primary care clinic. Collaborative practice with 4 physicians, panel of 1,800 patients.',
     ARRAY['Active NP license', 'DEA registration', '2+ years primary care'],
     105000, 130000, now() - interval '12 days'),

    (v_role3_id, target_org_id, 'Senior Software Engineer', 'Remote', 'full-time', 'draft',
     'Build core platform infrastructure for our clinical data pipeline. Greenfield work on a modern TypeScript/Go stack.',
     ARRAY['5+ years backend', 'TypeScript or Go', 'Distributed systems'],
     155000, 195000, now() - interval '5 days');

  -- ─── CANDIDATES – ICU RN (20) ──────────────────────────────────────────────
  INSERT INTO candidates (id, org_id, role_id, full_name, email, phone, location, current_title, current_company, experience_years, education, pipeline_stage, score, score_breakdown, source, created_at)
  VALUES
    (v_c1,  target_org_id, v_role1_id, 'Maria Santos',     'maria.santos@email.com',      '+13125551001', 'Chicago, IL',      'ICU RN',            'Northwestern Medicine',   6,  'BSN, DePaul University 2018',         'voice_qualified', 0.91, '{"clinical":0.94,"credentials":0.95,"culture":0.85,"tenure":0.88}', 'scout', now() - interval '15 days'),
    (v_c2,  target_org_id, v_role1_id, 'James Okafor',     'james.okafor@email.com',      '+13125551002', 'Evanston, IL',     'MICU Nurse',        'NorthShore University',   4,  'BSN, Loyola University 2020',         'voice_qualified', 0.87, '{"clinical":0.89,"credentials":0.90,"culture":0.82,"tenure":0.85}', 'scout', now() - interval '14 days'),
    (v_c3,  target_org_id, v_role1_id, 'Sarah Kim',        'sarah.kim@email.com',         '+13125551003', 'Oak Park, IL',     'SICU RN',           'Rush University Medical', 7,  'MSN, Rush University 2016',           'scheduled',       0.95, '{"clinical":0.97,"credentials":0.98,"culture":0.91,"tenure":0.93}', 'scout', now() - interval '14 days'),
    (v_c4,  target_org_id, v_role1_id, 'Devon Williams',   'devon.williams@email.com',    '+13125551004', 'Chicago, IL',      'Critical Care RN',  'Advocate Aurora',         5,  'BSN, UIC College of Nursing 2019',    'engaged',         0.82, '{"clinical":0.85,"credentials":0.86,"culture":0.77,"tenure":0.80}', 'scout', now() - interval '13 days'),
    (v_c5,  target_org_id, v_role1_id, 'Priya Patel',      'priya.patel@email.com',       '+13125551005', 'Schaumburg, IL',   'ICU RN',            'Alexian Brothers',        3,  'BSN, Purdue University 2021',         'scored',          0.78, '{"clinical":0.80,"credentials":0.82,"culture":0.74,"tenure":0.75}', 'scout', now() - interval '12 days'),
    (v_c6,  target_org_id, v_role1_id, 'Marcus Thompson',  'marcus.thompson@email.com',   '+13125551006', 'Joliet, IL',       'Trauma ICU RN',     'Silver Cross Hospital',   8,  'BSN, Illinois State University 2015', 'scored',          0.88, '{"clinical":0.90,"credentials":0.91,"culture":0.84,"tenure":0.87}', 'scout', now() - interval '12 days'),
    (v_c7,  target_org_id, v_role1_id, 'Aisha Johnson',    'aisha.johnson@email.com',     '+13125551007', 'Waukegan, IL',     'CVICU RN',          'Advocate Condell',        5,  'BSN, Northeastern Illinois 2019',     'scored',          0.84, '{"clinical":0.86,"credentials":0.87,"culture":0.80,"tenure":0.83}', 'scout', now() - interval '11 days'),
    (v_c8,  target_org_id, v_role1_id, 'Tyler Chen',       'tyler.chen@email.com',        '+13125551008', 'Naperville, IL',   'NICU RN',           'Edward-Elmhurst Health',  4,  'BSN, North Central College 2020',     'discovered',      0.72, '{"clinical":0.75,"credentials":0.76,"culture":0.68,"tenure":0.70}', 'scout', now() - interval '10 days'),
    (v_c9,  target_org_id, v_role1_id, 'Fatima Al-Hassan', 'fatima.alhassan@email.com',   '+13125551009', 'Chicago, IL',      'ICU Float RN',      'UChicago Medicine',       6,  'BSN, Olivet Nazarene University 2018','discovered',      0.83, '{"clinical":0.85,"credentials":0.86,"culture":0.79,"tenure":0.82}', 'scout', now() - interval '9 days'),
    (v_c10, target_org_id, v_role1_id, 'Ryan Murphy',      'ryan.murphy@email.com',       '+13125551010', 'Aurora, IL',       'CTICU RN',          'Rush Copley Medical',     9,  'MSN, University of Illinois 2014',    'discovered',      0.89, '{"clinical":0.91,"credentials":0.92,"culture":0.86,"tenure":0.88}', 'scout', now() - interval '8 days'),
    (v_c11, target_org_id, v_role1_id, 'Keisha Brown',     'keisha.brown@email.com',      '+13125551011', 'Cicero, IL',       'Step-Down RN',      'Mount Sinai Hospital',    2,  'BSN, Governors State University 2022','discovered',      0.65, '{"clinical":0.67,"credentials":0.68,"culture":0.62,"tenure":0.63}', 'scout', now() - interval '7 days'),
    (v_c12, target_org_id, v_role1_id, 'Carlos Rivera',    'carlos.rivera@email.com',     '+13125551012', 'Berwyn, IL',       'ICU RN',            'Loyola Medicine',         5,  'BSN, DePaul University 2019',         'discovered',      0.80, '{"clinical":0.82,"credentials":0.83,"culture":0.76,"tenure":0.79}', 'scout', now() - interval '6 days'),
    (v_c13, target_org_id, v_role1_id, 'Hannah Lee',       'hannah.lee@email.com',        '+13125551013', 'Park Ridge, IL',   'PICU RN',           'Advocate Lutheran',       6,  'BSN, Elmhurst University 2018',       'discovered',      0.77, '{"clinical":0.79,"credentials":0.80,"culture":0.73,"tenure":0.75}', 'scout', now() - interval '5 days'),
    (v_c14, target_org_id, v_role1_id, 'Darnell Jackson',  'darnell.jackson@email.com',   '+13125551014', 'Harvey, IL',       'ED RN',             'Ingalls Memorial',        3,  'ADN, Prairie State College 2021',     'discovered',      0.61, '{"clinical":0.63,"credentials":0.64,"culture":0.58,"tenure":0.60}', 'scout', now() - interval '4 days'),
    (v_c15, target_org_id, v_role1_id, 'Lena Kowalski',    'lena.kowalski@email.com',     '+13125551015', 'Orland Park, IL',  'ICU Charge RN',     'Palos Health',            10, 'BSN, Trinity Christian College 2013', 'discovered',      0.93, '{"clinical":0.95,"credentials":0.96,"culture":0.90,"tenure":0.92}', 'scout', now() - interval '3 days'),
    (v_c16, target_org_id, v_role1_id, 'Omar Farouk',      'omar.farouk@email.com',       '+13125551016', 'Chicago, IL',      'MICU RN',           'John H. Stroger Jr.',     4,  'BSN, Chicago State University 2020',  'discovered',      0.74, '{"clinical":0.76,"credentials":0.77,"culture":0.70,"tenure":0.73}', 'scout', now() - interval '2 days'),
    (v_c17, target_org_id, v_role1_id, 'Brianna Scott',    'brianna.scott@email.com',     '+13125551017', 'Tinley Park, IL',  'ICU RN',            'Franciscan Health',       5,  'BSN, Lewis University 2019',          'discovered',      0.81, '{"clinical":0.83,"credentials":0.84,"culture":0.77,"tenure":0.80}', 'scout', now() - interval '1 day'),
    (v_c18, target_org_id, v_role1_id, 'Ethan Park',       'ethan.park@email.com',        '+13125551018', 'Skokie, IL',       'Neuro ICU RN',      'NorthShore Evanston',     7,  'MSN, Loyola University 2016',         'discovered',      0.86, '{"clinical":0.88,"credentials":0.89,"culture":0.82,"tenure":0.85}', 'scout', now() - interval '12 hours'),
    (v_c19, target_org_id, v_role1_id, 'Jasmine Walker',   'jasmine.walker@email.com',    '+13125551019', 'Maywood, IL',      'ICU RN',            'Loyola University MC',    3,  'BSN, Benedictine University 2021',    'discovered',      0.70, '{"clinical":0.72,"credentials":0.73,"culture":0.67,"tenure":0.69}', 'scout', now() - interval '6 hours'),
    (v_c20, target_org_id, v_role1_id, 'Victor Nguyen',    'victor.nguyen@email.com',     '+13125551020', 'Glenview, IL',     'Cardiac ICU RN',    'NorthShore Glenbrook',    6,  'BSN, University of Wisconsin 2018',   'discovered',      0.85, '{"clinical":0.87,"credentials":0.88,"culture":0.81,"tenure":0.84}', 'scout', now() - interval '2 hours'),

    -- ─── CANDIDATES – NP PRIMARY CARE (12) ──────────────────────────────────
    (v_c21, target_org_id, v_role2_id, 'Diana Reyes',      'diana.reyes@email.com',       '+16305552001', 'Naperville, IL',   'FNP',               'Duly Health and Care',    5,  'MSN, North Central College 2019',     'voice_qualified', 0.93, '{"clinical":0.95,"credentials":0.96,"culture":0.89,"tenure":0.91}', 'scout', now() - interval '10 days'),
    (v_c22, target_org_id, v_role2_id, 'Michael Foster',   'michael.foster@email.com',    '+16305552002', 'Wheaton, IL',      'NP Primary Care',   'Northwestern Medicine',   7,  'DNP, Wheaton College 2016',           'scheduled',       0.96, '{"clinical":0.98,"credentials":0.97,"culture":0.93,"tenure":0.95}', 'scout', now() - interval '9 days'),
    (v_c23, target_org_id, v_role2_id, 'Samantha Cruz',    'samantha.cruz@email.com',     '+16305552003', 'Bolingbrook, IL',  'AGNP',              'Advocate Medical Group',  4,  'MSN, Aurora University 2020',         'engaged',         0.85, '{"clinical":0.87,"credentials":0.88,"culture":0.81,"tenure":0.84}', 'scout', now() - interval '8 days'),
    (v_c24, target_org_id, v_role2_id, 'Jerome Davis',     'jerome.davis@email.com',      '+16305552004', 'Plainfield, IL',   'FNP',               'AMITA Health',            6,  'MSN, University of St. Francis 2018', 'scored',          0.88, '{"clinical":0.90,"credentials":0.91,"culture":0.84,"tenure":0.87}', 'scout', now() - interval '7 days'),
    (v_c25, target_org_id, v_role2_id, 'Nicole Tran',      'nicole.tran@email.com',       '+16305552005', 'Aurora, IL',       'PNP',               'Rush Copley',             3,  'MSN, Purdue University Northwest 2021','scored',         0.79, '{"clinical":0.81,"credentials":0.82,"culture":0.75,"tenure":0.78}', 'scout', now() - interval '6 days'),
    (v_c26, target_org_id, v_role2_id, 'Aaron Mitchell',   'aaron.mitchell@email.com',    '+16305552006', 'Lisle, IL',        'FNP-C',             'DuPage Medical Group',    8,  'DNP, Northern Illinois University 2015','discovered',    0.91, '{"clinical":0.93,"credentials":0.94,"culture":0.87,"tenure":0.90}', 'scout', now() - interval '5 days'),
    (v_c27, target_org_id, v_role2_id, 'Tina Zhao',        'tina.zhao@email.com',         '+16305552007', 'Downers Grove, IL','NP Urgent Care',    'Elmhurst Clinic',         2,  'MSN, Elmhurst University 2022',       'discovered',      0.66, '{"clinical":0.68,"credentials":0.69,"culture":0.63,"tenure":0.65}', 'scout', now() - interval '4 days'),
    (v_c28, target_org_id, v_role2_id, 'Luis Hernandez',   'luis.hernandez@email.com',    '+16305552008', 'Romeoville, IL',   'WHNP',              'Planned Parenthood',      5,  'MSN, Lewis University 2019',          'discovered',      0.77, '{"clinical":0.79,"credentials":0.80,"culture":0.73,"tenure":0.76}', 'scout', now() - interval '3 days'),
    (v_c29, target_org_id, v_role2_id, 'Rachel Green',     'rachel.green@email.com',      '+16305552009', 'Batavia, IL',      'FNP',               'Delnor Hospital',         4,  'MSN, Illinois Wesleyan 2020',         'discovered',      0.82, '{"clinical":0.84,"credentials":0.85,"culture":0.78,"tenure":0.81}', 'scout', now() - interval '2 days'),
    (v_c30, target_org_id, v_role2_id, 'Kevin Park',       'kevin.park@email.com',        '+16305552010', 'St. Charles, IL',  'ACNP',              'Northwestern Medicine',   9,  'DNP, Rush University 2014',           'discovered',      0.90, '{"clinical":0.92,"credentials":0.93,"culture":0.86,"tenure":0.89}', 'scout', now() - interval '1 day'),
    (v_c31, target_org_id, v_role2_id, 'Monique Bell',     'monique.bell@email.com',      '+16305552011', 'Geneva, IL',       'FNP',               'Northwestern Medicine',   6,  'MSN, Concordia University 2018',      'discovered',      0.84, '{"clinical":0.86,"credentials":0.87,"culture":0.80,"tenure":0.83}', 'scout', now() - interval '18 hours'),
    (v_c32, target_org_id, v_role2_id, 'Patrick O''Brien', 'patrick.obrien@email.com',    '+16305552012', 'Oswego, IL',       'FNP-BC',            'OSF Healthcare',          7,  'MSN, Saint Xavier University 2016',   'discovered',      0.87, '{"clinical":0.89,"credentials":0.90,"culture":0.83,"tenure":0.86}', 'scout', now() - interval '8 hours'),

    -- ─── CANDIDATES – SENIOR SWE (8) ─────────────────────────────────────────
    (v_c33, target_org_id, v_role3_id, 'Alex Patel',       'alex.patel@email.com',        '+17735553001', 'Chicago, IL',      'Senior SWE',        'Epic Systems',            7,  'BS CS, University of Illinois 2016',  'voice_qualified', 0.94, '{"technical":0.96,"domain":0.95,"culture":0.90,"tenure":0.93}',   'scout', now() - interval '4 days'),
    (v_c34, target_org_id, v_role3_id, 'Jordan Blake',     'jordan.blake@email.com',      '+17735553002', 'Remote',           'Staff Engineer',    'Cerner',                  9,  'MS CS, Georgia Tech 2014',            'engaged',         0.91, '{"technical":0.93,"domain":0.96,"culture":0.87,"tenure":0.90}',   'scout', now() - interval '3 days'),
    (v_c35, target_org_id, v_role3_id, 'Morgan Hayes',     'morgan.hayes@email.com',      '+17735553003', 'Evanston, IL',     'Sr. Backend Engineer','Tempus',                 6,  'BS CS, Northwestern University 2017', 'scored',          0.88, '{"technical":0.90,"domain":0.88,"culture":0.85,"tenure":0.87}',   'scout', now() - interval '3 days'),
    (v_c36, target_org_id, v_role3_id, 'Cameron Liu',      'cameron.liu@email.com',       '+17735553004', 'Chicago, IL',      'Senior Engineer',   'Turing',                  5,  'BS CS, University of Chicago 2018',   'scored',          0.83, '{"technical":0.85,"domain":0.82,"culture":0.80,"tenure":0.83}',   'scout', now() - interval '2 days'),
    (v_c37, target_org_id, v_role3_id, 'Taylor Singh',     'taylor.singh@email.com',      '+17735553005', 'Remote',           'Sr. Software Engineer','Flatiron Health',        8,  'MS CS, Carnegie Mellon 2015',         'discovered',      0.92, '{"technical":0.94,"domain":0.93,"culture":0.88,"tenure":0.91}',   'scout', now() - interval '1 day'),
    (v_c38, target_org_id, v_role3_id, 'Riley Foster',     'riley.foster@email.com',      '+17735553006', 'Chicago, IL',      'Backend Engineer',  'Outcome Health',          4,  'BS CS, DePaul University 2020',       'discovered',      0.76, '{"technical":0.78,"domain":0.75,"culture":0.73,"tenure":0.76}',   'scout', now() - interval '20 hours'),
    (v_c39, target_org_id, v_role3_id, 'Quinn Nakamura',   'quinn.nakamura@email.com',    '+17735553007', 'Remote',           'Senior SWE – Platform','Availity',              10, 'BS CS, University of Washington 2013','discovered',      0.89, '{"technical":0.91,"domain":0.90,"culture":0.86,"tenure":0.89}',   'scout', now() - interval '10 hours'),
    (v_c40, target_org_id, v_role3_id, 'Skylar Rhodes',    'skylar.rhodes@email.com',     '+17735553008', 'Chicago, IL',      'Full Stack Engineer','RXNT',                   5,  'BS CS, Illinois Tech 2019',           'discovered',      0.80, '{"technical":0.82,"domain":0.79,"culture":0.77,"tenure":0.80}',   'scout', now() - interval '4 hours');

  -- ─── VOICE CALLS ───────────────────────────────────────────────────────────
  INSERT INTO voice_calls (id, org_id, role_id, candidate_id, status, call_type, duration_seconds, qualification_status, call_summary, extracted_data, created_at)
  VALUES
    (v_vc1, target_org_id, v_role1_id, v_c1, 'completed', 'outbound', 487,  'qualified',
     'Maria has 6 years of ICU experience with strong CRRT background. Very interested in night shift. Salary expectations align well with our range.',
     '{"licenses":["RN - IL Active","ACLS","BLS","CCRN"],"skills":["CRRT","Hemodynamic monitoring","Vent management"],"start_date":"2 weeks notice","shift_preference":"nights","salary_target":92000}',
     now() - interval '13 days'),

    (v_vc2, target_org_id, v_role1_id, v_c2, 'completed', 'outbound', 412,  'qualified',
     'James brings 4 years MICU experience, ACLS certified. Asked good questions about ICU patient ratios. Would prefer days but open to nights.',
     '{"licenses":["RN - IL Active","ACLS","BLS"],"skills":["Arterial lines","Central lines","Chest tubes"],"start_date":"3 weeks notice","shift_preference":"days","salary_target":88000}',
     now() - interval '12 days'),

    (v_vc3, target_org_id, v_role1_id, v_c3, 'completed', 'outbound', 531,  'qualified',
     'Sarah is an exceptional candidate. MSN-prepared, 7 years ICU, previous charge RN. Researched our hospital system thoroughly. Seeking $90k+.',
     '{"licenses":["RN - IL Active","ACLS","BLS","PALS"],"certifications":["CCRN 2021","TNCC"],"skills":["Charge experience","IABP","ECMO support"],"salary_target":92000}',
     now() - interval '12 days'),

    (v_vc4, target_org_id, v_role2_id, v_c21,'completed', 'outbound', 398,  'qualified',
     'Diana is an FNP with 5 years primary care. Currently managing her own panel of 1,600 patients. Excited about our collaborative model.',
     '{"licenses":["NP - IL Active","DEA Registered","RN - IL Active"],"certifications":["FNP-BC"],"skills":["Chronic disease management","Epic EHR","Telehealth"],"salary_target":120000}',
     now() - interval '8 days'),

    (v_vc5, target_org_id, v_role2_id, v_c22,'completed', 'outbound', 612,  'qualified',
     'Michael is a DNP with 7 years experience and his own established panel. Outstanding communication skills. Highly recommended.',
     '{"licenses":["NP - IL Active","DEA Registered","RN - IL Active"],"certifications":["FNP-BC","DNP"],"skills":["Panel management","Quality improvement","Mentorship"],"salary_target":128000}',
     now() - interval '7 days'),

    (v_vc6, target_org_id, v_role3_id, v_c33,'completed', 'outbound', 556,  'qualified',
     'Alex has deep healthcare software experience at Epic. Knows FHIR and HL7 well. Strong TypeScript skills. Compensation expectations match.',
     '{"languages":["TypeScript","Go","Python"],"frameworks":["Node.js","React","gRPC"],"domain":["FHIR R4","HL7 v2","Epic APIs","AWS"],"salary_target":185000}',
     now() - interval '2 days'),

    (v_vc7, target_org_id, v_role1_id, v_c6, 'completed', 'outbound', 310,  'disqualified',
     'Marcus has strong experience but indicated he is not actively looking and would require a $15k salary premium above our posted range.',
     '{"licenses":["RN - IL Active","ACLS","BLS","TNCC"],"certifications":["CCRN"],"salary_target":110000,"note":"above budget"}',
     now() - interval '10 days'),

    (v_vc8, target_org_id, v_role2_id, v_c23,'completed', 'outbound', 445,  'qualified',
     'Samantha has 4 years AGNP experience, solid Epic skills. Looking to transition from specialist to primary care. Good fit culturally.',
     '{"licenses":["NP - IL Active","DEA Registered","RN - IL Active"],"certifications":["AGNP-C"],"skills":["Epic EHR","Chronic disease","Telehealth"],"salary_target":115000}',
     now() - interval '6 days');

  -- ─── VOICE TRANSCRIPTS ─────────────────────────────────────────────────────
  INSERT INTO voice_transcripts (id, call_id, entries, created_at)
  VALUES
    (gen_random_uuid(), v_vc1,
     '[{"role":"agent","text":"Hi, may I speak with Maria Santos?"},{"role":"candidate","text":"This is Maria."},{"role":"agent","text":"Maria, I''m calling from Alivio on behalf of Midwest Health System regarding the ICU RN opening. Do you have a few minutes?"},{"role":"candidate","text":"Yes, absolutely. I saw the posting and was hoping to hear more."},{"role":"agent","text":"Can you tell me about your current ICU experience?"},{"role":"candidate","text":"I''ve been at Northwestern for 6 years, mostly in the medical ICU. I''m CCRN certified and have been doing CRRT for about 3 years now."},{"role":"agent","text":"Are you open to night shifts?"},{"role":"candidate","text":"Yes, nights actually work better for me right now."},{"role":"agent","text":"What are your salary expectations?"},{"role":"candidate","text":"I''m currently at $88k. I''d be looking for something in the $90 to $95 range."},{"role":"agent","text":"That fits well with what they''ve budgeted. I''ll pass along your information."},{"role":"candidate","text":"Definitely, yes."}]',
     now() - interval '13 days'),

    (gen_random_uuid(), v_vc3,
     '[{"role":"agent","text":"Hi Sarah, this is Alivio calling about the ICU RN position at Midwest Health System."},{"role":"candidate","text":"Oh great, I''ve been looking forward to this call."},{"role":"agent","text":"Tell me about your ICU background."},{"role":"candidate","text":"I have 7 years in critical care, started in the SICU at Rush and moved into charge about 2 years ago. I also have my CCRN and TNCC."},{"role":"agent","text":"What draws you to Midwest Health specifically?"},{"role":"candidate","text":"I researched your Level I trauma volume and your ECMO program. I''ve been wanting to get more ECMO experience."},{"role":"agent","text":"Salary range?"},{"role":"candidate","text":"I''m at $92k currently. I''d realistically need $90 or above to make the move."},{"role":"agent","text":"That works. We''d love to set up a formal interview."},{"role":"candidate","text":"Absolutely, yes."}]',
     now() - interval '12 days'),

    (gen_random_uuid(), v_vc4,
     '[{"role":"agent","text":"Hi Diana, calling from Alivio about a Nurse Practitioner opening in Naperville."},{"role":"candidate","text":"Yes, I saw it — FNP primary care, right?"},{"role":"agent","text":"That''s right. Can you tell me about your current practice?"},{"role":"candidate","text":"I''ve been an FNP for 5 years. I manage about 1,600 patients, mostly chronic disease — diabetes, hypertension, heart failure."},{"role":"agent","text":"Epic experience?"},{"role":"candidate","text":"Yes, heavy Epic user. I also do telehealth twice a week."},{"role":"agent","text":"What''s your current comp and what are you targeting?"},{"role":"candidate","text":"Base of $115k. I''d be happy at $118 to $125."},{"role":"agent","text":"That''s well within range. Would you like to move forward?"},{"role":"candidate","text":"I''d love to. That''s exactly what I''m looking for."}]',
     now() - interval '8 days'),

    (gen_random_uuid(), v_vc5,
     '[{"role":"agent","text":"Michael, thanks for picking up. This is about the NP Primary Care opening in Naperville."},{"role":"candidate","text":"I''ve been expecting your call. I submitted my application last week."},{"role":"agent","text":"You have a DNP — tell me about your background."},{"role":"candidate","text":"7 years post-grad, all in primary care. Currently managing 2,100 patients. I''ve been involved in our clinic''s QI committee."},{"role":"agent","text":"Salary expectations?"},{"role":"candidate","text":"I''m at $122k. Would need at least that or ideally $128k."},{"role":"agent","text":"I think that''s achievable. Any concerns about the 4-physician collaborative model?"},{"role":"candidate","text":"None at all. I see that as a plus."},{"role":"agent","text":"No overnight call, occasional after-hours phone coverage."},{"role":"candidate","text":"Sounds great. I''m very interested."}]',
     now() - interval '7 days'),

    (gen_random_uuid(), v_vc6,
     '[{"role":"agent","text":"Alex, hi — calling from Alivio about the Senior Software Engineer role at a healthcare tech company."},{"role":"candidate","text":"Hey, yes. TypeScript and Go platform work — sounds like my wheelhouse."},{"role":"agent","text":"Tell me about your healthcare software background."},{"role":"candidate","text":"7 years at Epic Systems on interoperability. I know FHIR R4 and HL7 v2 deeply. Last two years building the API gateway."},{"role":"agent","text":"Comp situation?"},{"role":"candidate","text":"Base is $175k plus RSUs. I''d want around $185k to make the move."},{"role":"agent","text":"That''s within range. Open to full remote?"},{"role":"candidate","text":"Yes, full remote preferred. I can travel for quarterly meetups."},{"role":"agent","text":"I''ll set up a technical screen. Available next week?"},{"role":"candidate","text":"Next week works, any day after 2pm."}]',
     now() - interval '2 days'),

    (gen_random_uuid(), v_vc7,
     '[{"role":"agent","text":"Hi Marcus, calling from Alivio about an ICU RN opening at Midwest Health System."},{"role":"candidate","text":"Hey, yeah — I did see that listing but I''m not actively searching right now."},{"role":"agent","text":"Any chance you''d consider the right opportunity?"},{"role":"candidate","text":"Maybe. What''s the compensation?"},{"role":"agent","text":"Posted range is $72k to $95k."},{"role":"candidate","text":"I''m at $96k currently. I''d need at least $110k to leave. Not trying to waste your time."},{"role":"agent","text":"I appreciate the honesty — that''s above what they''ve budgeted."},{"role":"candidate","text":"Sure, keep me in mind."}]',
     now() - interval '10 days');

  -- ─── VOICE SETTINGS ───────────────────────────────────────────────────────
  INSERT INTO voice_settings (id, role_id, enabled, score_threshold, outreach_tone, created_at)
  VALUES
    (gen_random_uuid(), v_role1_id, true,  0.75, 'conversational', now() - interval '17 days'),
    (gen_random_uuid(), v_role2_id, true,  0.80, 'professional',   now() - interval '11 days'),
    (gen_random_uuid(), v_role3_id, false, 0.85, 'conversational', now() - interval '4 days');

  -- ─── AGENT ACTIVITY LOG ───────────────────────────────────────────────────
  INSERT INTO agent_activity_log (id, org_id, role_id, candidate_id, agent_name, action, metadata, created_at)
  VALUES
    (gen_random_uuid(), target_org_id, v_role1_id, v_c1,  'scout',    'Discovered candidate matching ICU RN criteria via LinkedIn', '{"source":"linkedin","match_score":0.91}', now() - interval '15 days'),
    (gen_random_uuid(), target_org_id, v_role1_id, v_c2,  'scout',    'Discovered candidate via healthcare job board cross-match', '{"source":"indeed","match_score":0.87}', now() - interval '14 days 12 hours'),
    (gen_random_uuid(), target_org_id, v_role1_id, v_c3,  'scout',    'Surfaced high-potential MSN candidate from talent pool', '{"source":"internal_db","match_score":0.95}', now() - interval '14 days'),
    (gen_random_uuid(), target_org_id, v_role1_id, v_c1,  'enrich',   'Enriched profile: verified CCRN, confirmed CRRT experience', '{"fields_enriched":["certifications","skills","salary_data"]}', now() - interval '14 days'),
    (gen_random_uuid(), target_org_id, v_role1_id, v_c2,  'enrich',   'Enriched profile: confirmed ACLS, employment history verified', '{"fields_enriched":["certifications","employment_history"]}', now() - interval '13 days 18 hours'),
    (gen_random_uuid(), target_org_id, v_role1_id, v_c3,  'enrich',   'Enriched profile: confirmed CCRN + TNCC, charge RN history', '{"fields_enriched":["certifications","leadership_history"]}', now() - interval '13 days 12 hours'),
    (gen_random_uuid(), target_org_id, v_role1_id, v_c1,  'signal',   'Engagement signal: viewed job posting 3x in 48h', '{"signal_type":"job_view","count":3,"platform":"career_site"}', now() - interval '14 days'),
    (gen_random_uuid(), target_org_id, v_role1_id, v_c3,  'signal',   'Engagement signal: updated LinkedIn profile this week', '{"signal_type":"profile_update","platform":"linkedin"}', now() - interval '13 days'),
    (gen_random_uuid(), target_org_id, v_role1_id, v_c1,  'cortex',   'Scored candidate 91/100 — strong clinical match, culture fit high', '{"score":0.91,"breakdown":{"clinical":0.94,"credentials":0.95,"culture":0.85}}', now() - interval '14 days'),
    (gen_random_uuid(), target_org_id, v_role1_id, v_c2,  'cortex',   'Scored candidate 87/100 — solid MICU background, prefers days', '{"score":0.87,"breakdown":{"clinical":0.89,"credentials":0.90,"culture":0.82}}', now() - interval '13 days 12 hours'),
    (gen_random_uuid(), target_org_id, v_role1_id, v_c3,  'cortex',   'Scored candidate 95/100 — exceptional profile, top of pipeline', '{"score":0.95,"breakdown":{"clinical":0.97,"credentials":0.98,"culture":0.91}}', now() - interval '13 days'),
    (gen_random_uuid(), target_org_id, v_role1_id, v_c4,  'cortex',   'Scored candidate 82/100 — qualified, monitor for engagement signals', '{"score":0.82,"breakdown":{"clinical":0.85,"credentials":0.86,"culture":0.77}}', now() - interval '12 days'),
    (gen_random_uuid(), target_org_id, v_role1_id, v_c1,  'voice',    'Outbound call connected — duration 8m 7s', '{"duration":487,"outcome":"qualified"}', now() - interval '13 days'),
    (gen_random_uuid(), target_org_id, v_role1_id, v_c2,  'voice',    'Outbound call connected — duration 6m 52s', '{"duration":412,"outcome":"qualified"}', now() - interval '12 days'),
    (gen_random_uuid(), target_org_id, v_role1_id, v_c3,  'voice',    'Outbound call connected — duration 8m 51s', '{"duration":531,"outcome":"qualified"}', now() - interval '12 days'),
    (gen_random_uuid(), target_org_id, v_role1_id, v_c6,  'voice',    'Outbound call connected — compensation mismatch, not qualifying', '{"duration":310,"outcome":"disqualified"}', now() - interval '10 days'),
    (gen_random_uuid(), target_org_id, v_role1_id, v_c1,  'engage',   'Sent personalized outreach email referencing CRRT expertise', '{"channel":"email","template":"personalized_v2","opened":true}', now() - interval '13 days'),
    (gen_random_uuid(), target_org_id, v_role1_id, v_c2,  'engage',   'Sent follow-up message after voice screen, shared benefits summary', '{"channel":"email","template":"post_voice_followup"}', now() - interval '12 days'),
    (gen_random_uuid(), target_org_id, v_role1_id, v_c3,  'engage',   'Sent priority outreach confirming interview interest', '{"channel":"email","template":"priority_candidate"}', now() - interval '12 days'),
    (gen_random_uuid(), target_org_id, v_role1_id, v_c3,  'schedule', 'Interview scheduled: Sarah Kim — Tue Jan 28 10:00 AM CST', '{"interview_type":"panel","date":"2025-01-28","time":"10:00"}', now() - interval '11 days'),
    (gen_random_uuid(), target_org_id, v_role1_id, v_c4,  'engage',   'Sent initial outreach — awaiting response', '{"channel":"linkedin","template":"initial_outreach"}', now() - interval '11 days'),
    (gen_random_uuid(), target_org_id, v_role1_id, v_c5,  'scout',    'Discovered candidate from nursing school alumni database', '{"source":"alumni_db","match_score":0.78}', now() - interval '12 days'),
    (gen_random_uuid(), target_org_id, v_role1_id, v_c7,  'scout',    'Discovered candidate with CVICU background', '{"source":"linkedin","match_score":0.84}', now() - interval '11 days'),
    (gen_random_uuid(), target_org_id, v_role1_id, v_c8,  'scout',    'Discovered candidate — NICU background, evaluating ICU fit', '{"source":"indeed","match_score":0.72}', now() - interval '10 days'),
    (gen_random_uuid(), target_org_id, v_role2_id, v_c21, 'scout',    'Discovered FNP candidate matching NP Primary Care criteria', '{"source":"linkedin","match_score":0.93}', now() - interval '10 days'),
    (gen_random_uuid(), target_org_id, v_role2_id, v_c22, 'scout',    'Surfaced DNP candidate with strong primary care background', '{"source":"doximity","match_score":0.96}', now() - interval '9 days 12 hours'),
    (gen_random_uuid(), target_org_id, v_role2_id, v_c21, 'enrich',   'Enriched NP profile: DEA confirmed, Epic proficiency validated', '{"fields_enriched":["dea_status","ehr_skills","panel_size"]}', now() - interval '9 days'),
    (gen_random_uuid(), target_org_id, v_role2_id, v_c22, 'enrich',   'Enriched DNP profile: confirmed 2100 patient panel, QI publication', '{"fields_enriched":["credentials","publications","panel_size"]}', now() - interval '8 days 18 hours'),
    (gen_random_uuid(), target_org_id, v_role2_id, v_c21, 'cortex',   'Scored candidate 93/100 — strong FNP fit for primary care panel', '{"score":0.93,"breakdown":{"clinical":0.95,"credentials":0.96,"culture":0.89}}', now() - interval '9 days'),
    (gen_random_uuid(), target_org_id, v_role2_id, v_c22, 'cortex',   'Scored candidate 96/100 — exceptional DNP, top candidate', '{"score":0.96,"breakdown":{"clinical":0.98,"credentials":0.97,"culture":0.93}}', now() - interval '8 days 12 hours'),
    (gen_random_uuid(), target_org_id, v_role2_id, v_c21, 'voice',    'Outbound call connected — 6m 38s, qualified', '{"duration":398,"outcome":"qualified"}', now() - interval '8 days'),
    (gen_random_uuid(), target_org_id, v_role2_id, v_c22, 'voice',    'Outbound call connected — 10m 12s, top candidate qualified', '{"duration":612,"outcome":"qualified"}', now() - interval '7 days'),
    (gen_random_uuid(), target_org_id, v_role2_id, v_c23, 'voice',    'Outbound call connected — 7m 25s, qualified', '{"duration":445,"outcome":"qualified"}', now() - interval '6 days'),
    (gen_random_uuid(), target_org_id, v_role2_id, v_c21, 'engage',   'Sent personalized email highlighting collaborative care model', '{"channel":"email","template":"personalized_np"}', now() - interval '8 days'),
    (gen_random_uuid(), target_org_id, v_role2_id, v_c22, 'engage',   'Priority outreach to Michael — confirmed interview interest', '{"channel":"email","template":"priority_candidate"}', now() - interval '7 days'),
    (gen_random_uuid(), target_org_id, v_role2_id, v_c22, 'schedule', 'Interview scheduled: Michael Foster — Wed Jan 29 2:00 PM CST', '{"interview_type":"panel","date":"2025-01-29","time":"14:00"}', now() - interval '6 days'),
    (gen_random_uuid(), target_org_id, v_role2_id, v_c23, 'engage',   'Sent follow-up after voice screen — awaiting scheduling confirmation', '{"channel":"email","template":"post_voice_followup"}', now() - interval '5 days'),
    (gen_random_uuid(), target_org_id, v_role2_id, v_c24, 'cortex',   'Scored candidate 88/100 — solid FNP with chronic disease focus', '{"score":0.88,"breakdown":{"clinical":0.90,"credentials":0.91,"culture":0.84}}', now() - interval '7 days'),
    (gen_random_uuid(), target_org_id, v_role3_id, v_c33, 'scout',    'Discovered Epic Systems engineer with FHIR expertise', '{"source":"linkedin","match_score":0.94}', now() - interval '4 days'),
    (gen_random_uuid(), target_org_id, v_role3_id, v_c34, 'scout',    'Discovered Cerner staff engineer with platform background', '{"source":"linkedin","match_score":0.91}', now() - interval '3 days 18 hours'),
    (gen_random_uuid(), target_org_id, v_role3_id, v_c37, 'scout',    'Discovered Carnegie Mellon engineer from Flatiron Health', '{"source":"github","match_score":0.92}', now() - interval '1 day'),
    (gen_random_uuid(), target_org_id, v_role3_id, v_c33, 'enrich',   'Enriched profile: confirmed FHIR R4 contributions, GitHub verified', '{"fields_enriched":["github_activity","oss_contributions","tech_stack"]}', now() - interval '3 days 12 hours'),
    (gen_random_uuid(), target_org_id, v_role3_id, v_c34, 'enrich',   'Enriched profile: Cerner employment confirmed, Stack Overflow top 5%', '{"fields_enriched":["employment","stackoverflow_rank"]}', now() - interval '3 days'),
    (gen_random_uuid(), target_org_id, v_role3_id, v_c33, 'signal',   'Engagement signal: starred our open source repo on GitHub', '{"signal_type":"github_star","platform":"github"}', now() - interval '3 days'),
    (gen_random_uuid(), target_org_id, v_role3_id, v_c33, 'cortex',   'Scored candidate 94/100 — exceptional FHIR background, top SWE', '{"score":0.94,"breakdown":{"technical":0.96,"domain":0.95,"culture":0.90}}', now() - interval '3 days'),
    (gen_random_uuid(), target_org_id, v_role3_id, v_c34, 'cortex',   'Scored candidate 91/100 — strong platform engineering background', '{"score":0.91,"breakdown":{"technical":0.93,"domain":0.96,"culture":0.87}}', now() - interval '3 days'),
    (gen_random_uuid(), target_org_id, v_role3_id, v_c33, 'voice',    'Outbound call connected — 9m 16s, qualified, interview aligned', '{"duration":556,"outcome":"qualified"}', now() - interval '2 days'),
    (gen_random_uuid(), target_org_id, v_role3_id, v_c34, 'engage',   'Sent personalized outreach referencing distributed systems work', '{"channel":"email","template":"personalized_swe"}', now() - interval '2 days'),
    (gen_random_uuid(), target_org_id, v_role3_id, v_c35, 'cortex',   'Scored candidate 88/100 — solid TypeScript, healthcare domain plus', '{"score":0.88,"breakdown":{"technical":0.90,"domain":0.88,"culture":0.85}}', now() - interval '2 days'),
    (gen_random_uuid(), target_org_id, v_role3_id, v_c36, 'cortex',   'Scored candidate 83/100 — good generalist, limited healthcare depth', '{"score":0.83,"breakdown":{"technical":0.85,"domain":0.82,"culture":0.80}}', now() - interval '1 day'),
    (gen_random_uuid(), target_org_id, v_role1_id, NULL,  'scout',    'Pipeline scan complete — 8 new ICU RN candidates queued for enrichment', '{"candidates_queued":8,"source_mix":{"linkedin":5,"indeed":2,"internal":1}}', now() - interval '6 hours'),
    (gen_random_uuid(), target_org_id, v_role2_id, NULL,  'scout',    'Pipeline scan complete — 4 new NP candidates discovered', '{"candidates_queued":4,"source_mix":{"doximity":2,"linkedin":2}}', now() - interval '3 hours'),
    (gen_random_uuid(), target_org_id, v_role3_id, NULL,  'scout',    'Pipeline scan complete — 5 new SWE candidates from GitHub signals', '{"candidates_queued":5,"source_mix":{"github":3,"linkedin":2}}', now() - interval '1 hour');

END;
$$;
