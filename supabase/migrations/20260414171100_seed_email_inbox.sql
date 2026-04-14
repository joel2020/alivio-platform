BEGIN;

DO
$$
DECLARE
  v_org_id UUID;
BEGIN
  SELECT id INTO v_org_id
  FROM organizations
  ORDER BY created_at ASC
  LIMIT 1;

  IF v_org_id IS NULL THEN
    RAISE NOTICE 'No organizations found. Skipping email inbox seed.';
    RETURN;
  END IF;

  INSERT INTO email_inbox (
    org_id,
    message_id,
    from_email,
    from_name,
    to_email,
    subject,
    body_text,
    received_at,
    has_attachment,
    processed,
    processing_status
  ) VALUES
  (v_org_id, 'msg-001',
   'sarah.johnson@northwesthealth.com',
   'Sarah Johnson',
   'joel@aliviosearchpartners.com',
   'Looking for ICU nurses - can you help?',
   'Hi Joel, we have 3 open ICU RN positions at Northwest Health. We have been struggling to fill them for 3 months. A colleague mentioned your firm. Can we schedule a call?',
   NOW() - INTERVAL '2 hours',
   false, false, 'pending'),

  (v_org_id, 'msg-002',
   'careers@memorialhospital.org',
   'David Chen',
   'joel@aliviosearchpartners.com',
   'Nurse Practitioner Resume - Attached',
   'Please find my resume attached. I am a FNP with 8 years experience looking for new opportunities in Chicago.',
   NOW() - INTERVAL '4 hours',
   true, false, 'pending'),

  (v_org_id, 'msg-003',
   'hr@sunriseclinic.com',
   'Michelle Torres',
   'joel@aliviosearchpartners.com',
   'Re: Healthcare Recruiting Services',
   'Hi Joel, thanks for reaching out. We actually have several openings right now including 2 ED nurses and a charge nurse. Would love to learn more about your AI platform.',
   NOW() - INTERVAL '1 day',
   false, true, 'completed'),

  (v_org_id, 'msg-004',
   'apply@vivianhealth.com',
   'James Walker RN',
   'joel@aliviosearchpartners.com',
   'Application: ICU Nurse Manager Position',
   'I am applying for the ICU Nurse Manager role. I have 12 years of ICU experience, BSN from University of Illinois, CCRN certified. Currently at Northwestern Memorial.',
   NOW() - INTERVAL '2 days',
   true, true, 'completed'),

  (v_org_id, 'msg-005',
   'recruiting@midwesthealth.com',
   'Karen Martinez',
   'joel@aliviosearchpartners.com',
   'Pricing question for your platform',
   'Hi, we are a 400-bed health system in Chicago. We are evaluating AI recruiting tools. Can you send me your pricing information?',
   NOW() - INTERVAL '3 days',
   false, false, 'pending')
  ON CONFLICT (message_id) DO NOTHING;
END
$$;

COMMIT;
