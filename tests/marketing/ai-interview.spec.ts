import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
test.use({launchOptions:{args:['--use-fake-ui-for-media-stream','--use-fake-device-for-media-stream']},permissions:['camera','microphone']});
const token='b'.repeat(64);
const questions=Array.from({length:8},(_,i)=>`Describe a role-related example for question ${i+1}.`);
async function mock(page:import('@playwright/test').Page){
 const actions:Record<string,unknown>[]=[];let state='invited',started:number|null=null;const answered:number[]=[];
 await page.route('https://*.supabase.co/**',async route=>{
  const url=new URL(route.request().url());
  if(url.pathname.endsWith('/candidate-interviews')){
   const b=route.request().postDataJSON();actions.push(b);
   if(b.token!==token)return route.fulfill({status:404,json:{error:'Invalid interview link.'}});
   if(b.action==='start'){if(!b.consent)return route.fulfill({status:400,json:{error:'Consent required'}});started??=Date.now();state='in_progress';}
   if(b.action==='human')state='human_requested';
   if(b.action==='upload')return route.fulfill({json:{data:{path:'test/answer.webm',token:'synthetic-upload-token'}}});
   if(b.action==='confirm')answered.push(b.index);
   if(b.action==='finish')state='completed';
   return route.fulfill({json:{data:{state,job_title:'Full-stack engineering lead',server_now:new Date().toISOString(),deadline:started?new Date(started+1800000).toISOString():null,questions:state==='in_progress'?questions:[],answered}}});
  }
  if(url.pathname.includes('/storage/'))return route.fulfill({json:{Key:'application-interviews/test/answer.webm'}});
  return route.fulfill({json:[]});
 });
 return actions;
}
test('private link, consent, accessible mobile layout and human alternative',async({page})=>{
 const actions=await mock(page);await page.setViewportSize({width:390,height:844});await page.goto('/client/interview#'+token);
 await expect(page.getByRole('heading',{name:'Your AI-guided video interview'})).toBeVisible();
 await expect(page.getByRole('button',{name:'Start 30-minute interview'})).toBeDisabled();
 expect(page.url()).not.toContain(token);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
 expect((await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze()).violations).toEqual([]);
 await page.getByRole('button',{name:'Request a human interview instead'}).click();
 await expect(page.getByRole('heading',{name:'Your human-interview request is saved.'})).toBeVisible();
 expect(actions.some(a=>a.action==='start')).toBe(false);
});
test('records a real synthetic video stream, saves answer, and preserves server deadline on reload',async({page})=>{
 const actions=await mock(page);await page.goto('/client/interview#'+token);
 await page.getByRole('checkbox').check();await page.getByRole('button',{name:'Start 30-minute interview'}).click();
 await expect(page.getByRole('heading',{name:'Question 1 of 8'})).toBeVisible();
 await page.getByRole('button',{name:'Record answer',exact:true}).click();
 await expect(page.getByRole('status').filter({hasText:'Recording'})).toBeVisible();
 await page.waitForTimeout(1200);await page.getByRole('button',{name:'Stop recording'}).click();
 await expect(page.getByLabel('Review your recorded answer')).toBeVisible();
 await page.getByRole('button',{name:'Save answer and continue'}).click();
 await expect(page.getByRole('heading',{name:'Question 2 of 8'})).toBeVisible();
 expect(actions.some(a=>a.action==='confirm'&&a.index===0)).toBe(true);
 const prior=await page.getByRole('timer').innerText();await page.reload();
 await expect(page.getByRole('heading',{name:'Question 2 of 8'})).toBeVisible();
 expect(await page.getByRole('timer').innerText()<=prior).toBe(true);
 expect(actions.filter(a=>a.action==='start')).toHaveLength(1);
});
test('server-expired session cannot start a new answer',async({page})=>{
 await page.route('https://*.supabase.co/**',route=>route.fulfill({json:{data:{state:'expired',job_title:'Engineer',server_now:new Date().toISOString(),deadline:new Date(Date.now()-1000).toISOString(),questions:[],answered:[]}}}));
 await page.goto('/client/interview#'+token);
 await expect(page.getByRole('button',{name:'Record answer',exact:true})).toBeDisabled();
 await expect(page.getByRole('status').filter({hasText:'30-minute interview has ended'})).toBeVisible();
});
test('30-minute deadline stops recording and releases camera and microphone',async({page})=>{
 await page.clock.install();await mock(page);await page.goto('/client/interview#'+token);
 await page.getByRole('checkbox').check();await page.getByRole('button',{name:'Start 30-minute interview'}).click();
 await page.getByRole('button',{name:'Record answer',exact:true}).click();
 await expect(page.getByRole('button',{name:'Stop recording'})).toBeVisible();
 await page.waitForTimeout(1100);await page.clock.fastForward(1800001);
 await expect(page.getByRole('timer')).toHaveText('0:00 remaining');
 await expect(page.getByRole('button',{name:'Stop recording'})).toHaveCount(0);
 expect(await page.getByLabel('Your camera preview').evaluate(v=>(v as HTMLVideoElement).srcObject instanceof MediaStream && ((v as HTMLVideoElement).srcObject as MediaStream).getTracks().every(t=>t.readyState==='ended'))).toBe(true);
});
