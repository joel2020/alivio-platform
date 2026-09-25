import {expect,test} from '@playwright/test';
const userId='00000000-0000-4000-8000-000000000101',orgId='00000000-0000-4000-8000-000000000102';
test('8/10 assessment requires a documented recruiter approval before sending',async({page})=>{
  const expires = Math.floor(Date.now() / 1000) + 3600;
  const jwt = `${Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url')}.${Buffer.from(JSON.stringify({ sub: userId, exp: expires, aud: 'authenticated', role: 'authenticated' })).toString('base64url')}.synthetic-signature`;
  const session = { access_token: jwt, refresh_token: 'synthetic-refresh', expires_at: expires, expires_in: 3600, token_type: 'bearer', user: { id: userId, email: 'ats-qa@example.com', aud: 'authenticated', role: 'authenticated', app_metadata: {}, user_metadata: {}, created_at: '2026-01-01T00:00:00Z' } };
  await page.addInitScript(({ session }) => {
    localStorage.setItem('sb-ovxttubotjebnaoedllu-auth-token', JSON.stringify(session));
  }, { session });

 const applicant={id:12,first_name:'Synthetic',last_name:'Candidate',email:'synthetic@example.test',job_title:'Engineer',status:'new',created_at:new Date().toISOString(),ai_review:{state:'review',score:8}};
 const actions:Record<string,unknown>[]=[];
 await page.route('https://*.supabase.co/**',async route=>{
  const url=new URL(route.request().url());
  if(url.pathname.endsWith('/candidate-applications')){
   const b=route.request().postDataJSON();
   return route.fulfill({json:{data:b.action==='list'?{applications:[applicant],jobs:[],roles:[],reviewers:[],is_admin:true,email_ready:true,followups_ready:false}:{application:applicant,events:[],messages:[]}}});
  }
  if(url.pathname.endsWith('/candidate-interviews')){
   const b=route.request().postDataJSON();actions.push(b);
   if(b.action==='approve')return route.fulfill({json:{data:{ok:true}}});
   return route.fulfill({json:{data:{review:{state:'review',score:8,last_error:null,job_snapshot:'TypeScript APIs',rubric:{criteria:[{requirement:'TypeScript',job_quote:'TypeScript'}],questions:['Describe your TypeScript work.']},assessment:{items:[{status:'met',evidence:'Built TypeScript APIs',explanation:'Specific implementation evidence'}]}},answers:[]}}});
  }
  if(url.pathname==='/auth/v1/user')return route.fulfill({json:session.user});
  if(url.pathname==='/rest/v1/users')return route.fulfill({json:{id:userId,org_id:orgId,full_name:'QA Recruiter',email:'synthetic@example.test',role:'admin',is_active:true}});
  if(url.pathname==='/rest/v1/organizations')return route.fulfill({json:{id:orgId,name:'Synthetic organization',plan:'pro',subscription_status:'active'}});
  if(url.pathname.endsWith('/rpc/is_platform_admin'))return route.fulfill({json:true});
  return route.fulfill({json:[]});
 });
 await page.goto('/applications');await page.getByRole('button',{name:/Synthetic Candidate/}).click();
 await expect(page.getByText('8/10',{exact:true})).toBeVisible();
 const approve=page.getByRole('button',{name:'Approve and send interview invitation'});
 await expect(approve).toBeDisabled();expect(actions.some(a=>a.action==='approve')).toBe(false);
 await page.getByLabel('Human review explanation').fill('I verified the TypeScript evidence and reviewed the role questions.');
 await approve.click();await expect(page.getByRole('status').filter({hasText:'Invitation queued'})).toBeVisible();
 expect(actions.filter(a=>a.action==='approve')).toHaveLength(1);
});
