INSERT INTO outreach_templates 
(org_id, name, subject, body, sequence_step)
SELECT
  o.id,
  t.name,
  t.subject,
  t.body,
  t.sequence_step
FROM organizations o
CROSS JOIN (
  VALUES
  (
    'Cold Intro',
    'Cutting nurse hiring time at {{hospital_name}}',
    'Hi {{contact_name}},

I run Alivio Search Partners — we use AI to help 
hospitals like {{hospital_name}} hire qualified 
nurses and clinical staff faster.

Most of our clients fill hard-to-staff roles in 
under 14 days. Would you be open to a quick 
15-minute call?

{{cal_link}}

Joel
Alivio Search Partners',
    1
  ),
  (
    'Follow Up',
    'The cost of one open nursing role: $52,000',
    'Hi {{contact_name}},

Just wanted to follow up on my last email.

The average cost of one unfilled nursing position 
is $52,000 in lost productivity.

Alivio uses AI to source and screen credentialed 
candidates so you only talk to qualified nurses.

Worth a 15-minute call?

{{cal_link}}',
    2
  ),
  (
    'Breakup Email',
    'Last note from me, {{contact_name}}',
    'Hi {{contact_name}},

Last follow up from me — I know you are busy.

If hiring qualified nurses and clinical staff is 
still a challenge at {{hospital_name}}, I would 
love to show you how Alivio works.

If the timing is not right, no worries — 
I will check back in a few months.

{{cal_link}}',
    3
  )
) AS t(name, subject, body, sequence_step)
WHERE NOT EXISTS (
  SELECT 1
  FROM outreach_templates existing
  WHERE existing.org_id = o.id
    AND existing.sequence_step = t.sequence_step
)
ON CONFLICT DO NOTHING;
