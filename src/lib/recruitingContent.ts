export const practices = [
  { slug: 'healthcare', title: 'Healthcare Recruiting', copy: 'Clinical, administrative, leadership, and revenue-driving healthcare roles.', image: '/images/healthcare-team.jpg', alt: 'Healthcare professionals discussing patient care', intro: 'We support healthcare organizations hiring for clinical, operational, and leadership roles across hospitals, physician groups, behavioral health, senior care, and healthcare technology companies.', roles: ['Physicians', 'Nurse leaders', 'Allied health professionals', 'Revenue cycle and operations', 'Behavioral health professionals', 'Healthcare sales and business development'] },
  { slug: 'technology', title: 'Technology Recruiting', copy: 'Software engineering, product, data, AI, infrastructure, and technical leadership.', image: '/images/technology-team.jpg', alt: 'Technology professionals collaborating around a table', intro: 'We help companies recruit technical talent in competitive markets. Direct sourcing and hands-on candidate vetting connect your team with people who fit the technical requirements, business context, and stage of your company.', roles: ['Software engineers', 'Full-stack engineers', 'AI/ML engineers', 'Product managers', 'Data engineers', 'Technical project managers', 'Engineering leaders'] },
  { slug: 'executive', title: 'Executive & Leadership Search', copy: 'Hard-to-fill leadership, operations, sales, and specialized professional roles.', image: '/images/recruiting-conversation.jpg', alt: 'Business professionals working through a shared brief', intro: 'Leadership hires shape the direction of your business. We conduct focused executive and professional search with careful assessment of experience, judgment, and long-term fit.', roles: ['Executive and senior leadership', 'Operations leaders', 'Sales and business development leaders', 'Healthcare executives', 'Engineering and product leaders', 'Specialized professionals'] },
];
export const searchSteps = [
  ['Intake & Search Strategy', 'We clarify the role, must-haves, compensation, location, selling points, and ideal candidate profile.'],
  ['Market Mapping & Outreach', 'We identify qualified candidates across relevant companies, regions, platforms, and talent pools.'],
  ['Screening & Shortlist', 'You receive qualified, interested candidates with context — not random resumes.'],
  ['Interview & Offer Support', 'We help manage candidate communication, feedback loops, offer expectations, and the close process.'],
];
export const candidateBenefits = ['Confidential career conversations', 'Direct access to growing companies', 'Guidance through interviews and offers', 'Healthcare, tech, leadership, and professional roles', 'No pressure, no spam, no generic job pushing'];

export const practiceSearchBriefs: Record<string, { heading: string; paragraphs: string[] }> = {
  healthcare: {
    heading: 'Plan a physician or healthcare leadership search.',
    paragraphs: [
      'For physician recruiting, define the specialty, care setting, patient population, schedule, call expectations, and required credentials. For nursing and healthcare leadership, clarify team size, reporting relationships, and operational priorities. These details guide sourcing and help candidates assess the opportunity.',
      'We screen experience and interest against the agreed brief and coordinate interview feedback. Employers retain responsibility for clinical credentialing, licensing verification, and hiring decisions; responsibilities are agreed before the search begins.',
    ],
  },
  technology: {
    heading: 'Technology and healthtech recruiting built around the work.',
    paragraphs: [
      'A useful technical search brief defines what the person will build, the systems they will own, and the decisions they need to make. We discuss the stack, product stage, seniority, and collaboration requirements before sourcing engineers, data specialists, product managers, or technical leaders.',
      'For healthtech teams, clarify which healthcare workflows, integrations, and data responsibilities the role touches. Separate essential domain experience from knowledge that can be learned. Agree the technical interview and work-sample criteria with your hiring team so candidates are assessed consistently.',
    ],
  },
  executive: {
    heading: 'Give your leadership search a clear mandate.',
    paragraphs: [
      'Define the outcomes a leader must deliver, the decisions they will own, and the team and resources available. Align the hiring stakeholders on essential experience, compensation parameters, and how leadership fit will be assessed before outreach begins.',
      'A focused executive search examines relevant scope and achievements alongside interest in your organization. Agree confidentiality expectations, interview ownership, and the reference process in the search brief so both candidates and decision-makers understand the next steps.',
    ],
  },
};
