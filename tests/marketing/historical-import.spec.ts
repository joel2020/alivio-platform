import { expect, test } from '@playwright/test';
import { createHash } from 'node:crypto';
import AxeBuilder from '@axe-core/playwright';
const userId='00000000-0000-4000-8000-000000000101',orgId='00000000-0000-4000-8000-000000000102';
test('historical import holds uncertain files, uploads only verified versions, and disables messaging', async ({page}) => {
  const expires = Math.floor(Date.now() / 1000) + 3600;
  const jwt = `${Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url')}.${Buffer.from(JSON.stringify({ sub: userId, exp: expires, aud: 'authenticated', role: 'authenticated' })).toString('base64url')}.synthetic-signature`;
  const session = { access_token: jwt, refresh_token: 'synthetic-refresh', expires_at: expires, expires_in: 3600, token_type: 'bearer', user: { id: userId, email: 'ats-qa@example.com', aud: 'authenticated', role: 'authenticated', app_metadata: {}, user_metadata: {}, created_at: '2026-01-01T00:00:00Z' } };
  await page.addInitScript(({ session }) => {
    localStorage.setItem('sb-ovxttubotjebnaoedllu-auth-token', JSON.stringify(session));
  }, { session });

  const bytes=Buffer.from('%PDF-1.4\nSynthetic resume\n%%EOF\n');
  const hash=createHash('sha256').update(bytes).digest('hex');
  const record={name:'Synthetic Person',first_name:'Synthetic',last_name:'Person',email:null,upload_sha256:hash,original_sha256:hash,sources:[{url:'https://mail.google.com/mail/u/0/#all/synthetic',subject:'Original email'}],flags:[],notes:['Verified synthetic file']};
  const manifest={batch:'qa',records:[record,{...record,name:'Held Person',upload_sha256:'b'.repeat(64),flags:['identity_requires_review']}]};
  const requests:string[]=[];
  let imported=false;
  const application={id:101,job_id:null,job_title:'Historical résumé · no job assigned',first_name:'Synthetic',last_name:'Person',email:null,status:'new',created_at:'2026-09-10T10:00:00Z',org_id:orgId,role_id:null,candidate_id:null,assigned_to:null,questionnaire:null,resume_filename:'resume.pdf',next_action:null,next_action_at:null,messages_stopped:true,historical_metadata:{...record,batch:'qa',flags:['missing_candidate_email']}};
  await page.route('https://*.supabase.co/**',async route=>{
    const url=new URL(route.request().url()); requests.push(url.pathname);
    if(url.pathname.endsWith('/import-historical-resume')) {
      const form=await new Request('https://example.test',{method:'POST',headers:{'content-type':route.request().headers()['content-type']},body:new Uint8Array(route.request().postDataBuffer()!).buffer}).formData();
      const metadata=JSON.parse(String(form.get('metadata')));
      expect(metadata.upload_sha256).toBe(hash); expect(metadata.email).toBeNull();
      expect(metadata).not.toHaveProperty('job_id'); expect(metadata).not.toHaveProperty('consent'); expect(form.get('resume')).toBeTruthy();
      imported=true; return route.fulfill({json:{data:{id:101,status:'imported',sha256:hash,messages_sent:0}}});
    }
    if(url.pathname.endsWith('/candidate-applications')) {
      const body=route.request().postDataJSON();
      expect(body.action).not.toBe('message');
      if(body.action==='list') return route.fulfill({json:{data:{applications:imported?[application]:[],jobs:[],roles:[],reviewers:[],is_admin:true,email_ready:true,followups_ready:false,next_cursor:null}}});
      if(body.action==='detail') return route.fulfill({json:{data:{application,events:[],messages:[]}}});
    }
    if(url.pathname==='/auth/v1/user') return route.fulfill({json:session.user});
    if(url.pathname==='/rest/v1/users') return route.fulfill({json:{id:userId,org_id:orgId,full_name:'QA',email:'qa@example.test',role:'admin',is_active:true}});
    if(url.pathname==='/rest/v1/organizations') return route.fulfill({json:{id:orgId,name:'QA',plan:'pro',subscription_status:'active'}});
    if(url.pathname.endsWith('/rpc/is_platform_admin')) return route.fulfill({json:true});
    return route.fulfill({json:[],headers:{'content-range':'0-0/0'}});
  });
  await page.goto('/applications');
  await page.getByText('Import historical résumés',{exact:true}).click();
  await page.getByLabel('Reviewed import manifest',{exact:true}).setInputFiles({name:'reviewed-import.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(manifest))});
  await page.getByLabel('Reviewed résumé files',{exact:true}).setInputFiles({name:'resume.pdf',mimeType:'application/pdf',buffer:bytes});
  await page.getByRole('button',{name:'Review selected files',exact:true}).click();
  await expect(page.getByText(/2 reviewed files · 1 ready · 1 held/)).toBeVisible();
  expect(requests.some(path=>path.endsWith('/import-historical-resume'))).toBe(false);
  await page.getByRole('button',{name:'Import 1 ready résumés',exact:true}).click();
  await expect(page.getByText('1 newly imported · 0 already saved · 0 failed.')).toBeVisible();
  expect(requests.filter(path=>path.endsWith('/import-historical-resume'))).toHaveLength(1);
  expect(requests.some(path=>/submit-application|application-messages/.test(path))).toBe(false);
  await page.getByRole('button',{name:/Synthetic Person/}).click();
  await expect(page.getByRole('button',{name:'Queue email',exact:true})).toBeDisabled();
  await expect(page.getByText('Questionnaire answers and consent were not collected for this historical résumé.')).toBeVisible();
  await expect(page.getByRole('link',{name:'Original email'})).toHaveAttribute('href',record.sources[0].url);
  const a11y=await new AxeBuilder({page}).include('.ats-page').withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
  expect(a11y.violations.map(v=>v.id)).toEqual([]);
  await page.setViewportSize({width:390,height:844});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
});
