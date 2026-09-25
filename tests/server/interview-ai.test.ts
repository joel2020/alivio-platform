import assert from 'node:assert/strict';
import {callAiWithFallback} from '../../supabase/functions/_shared/ai.ts';
Deno.test('Azure v1 interview JSON request supports deployed GPT-5.5 and never leaks provider errors',async()=>{
 const names=['AZURE_OPENAI_ENDPOINT','AZURE_OPENAI_API_KEY','AZURE_OPENAI_PRIMARY_DEPLOYMENT','AZURE_OPENAI_FALLBACK_DEPLOYMENT'];
 const old=names.map(n=>Deno.env.get(n));const originalFetch=globalThis.fetch;
 try{
  ['https://synthetic.openai.azure.com/','synthetic-test-key','gpt5.5','fallback'].forEach((v,i)=>Deno.env.set(names[i],v));
  globalThis.fetch=(async(input: RequestInfo | URL,init?: RequestInit)=>{
   assert.equal(String(input),'https://synthetic.openai.azure.com/openai/v1/chat/completions');
   const body=JSON.parse(String(init?.body));assert.equal(body.model,'gpt5.5');assert.equal(body.reasoning_effort,'none');assert.equal(body.temperature,undefined);assert.equal(body.max_tokens,undefined);assert.equal(body.max_completion_tokens,2600);assert.deepEqual(body.response_format,{type:'json_object'});
   return new Response(JSON.stringify({choices:[{message:{content:'{"ok":true}'}}]}));
  }) as typeof fetch;
  assert.equal((await callAiWithFallback({prompt:'JSON synthetic test',maxTokens:2600,jsonMode:true})).content,'{"ok":true}');
  globalThis.fetch=(async()=>new Response(JSON.stringify({error:{message:'SENSITIVE_PROVIDER_BODY'}}),{status:400})) as typeof fetch;
  await assert.rejects(callAiWithFallback({prompt:'JSON synthetic test'}),error=>error instanceof Error&&error.message==='Azure OpenAI HTTP 400');
 }finally{globalThis.fetch=originalFetch;names.forEach((n,i)=>old[i]===undefined?Deno.env.delete(n):Deno.env.set(n,old[i]!));}
});
