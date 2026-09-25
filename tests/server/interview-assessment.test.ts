import {test} from 'node:test';
import assert from 'node:assert/strict';
import {validateAssessment,validateRubric,INTERVIEW_THRESHOLD} from '../../supabase/functions/_shared/interview-assessment.ts';
const job='TypeScript PostgreSQL APIs testing leadership';
const rubric={criteria:job.split(' ').map(word=>({requirement:word,job_quote:word})),questions:Array.from({length:8},(_,i)=>`Describe role example ${i+1}?`)};
const resume='Built TypeScript applications, PostgreSQL databases, APIs, testing and leadership work.';
const assessment=(statuses:string[])=>({items:statuses.map(status=>({status,evidence:status==='not_evidenced'?'':'TypeScript',explanation:'Evidence requires recruiter verification.'}))});
test('8/10 is inclusive and the application computes points, ignoring model totals',()=>{
 assert.equal(validateAssessment({...assessment(['met','met','met','met','not_evidenced']),score:100},resume).score,INTERVIEW_THRESHOLD);
 assert.equal(validateAssessment(assessment(['met','met','met','partial','not_evidenced']),resume).score,7);
 assert.equal(validateAssessment(assessment(['met','met','met','met','met']),resume).score,10);
});
test('reject hallucinated evidence, invalid statuses, missing criteria and oversized AI strings',()=>{
 const invalid=assessment(['met','met','met','met','met']);invalid.items[0].evidence='I worked on Mars';
 assert.throws(()=>validateAssessment(invalid,resume));
 assert.throws(()=>validateAssessment(assessment(['excellent','met','met','met','met']),resume));
 assert.throws(()=>validateAssessment({items:[]},resume));
 assert.throws(()=>validateAssessment({items:Array(5).fill({status:'met',evidence:'TypeScript',explanation:'x'.repeat(1001)})},resume));
});
test('rubric must quote the job and include exactly five distinct criteria and eight distinct questions',()=>{
 assert.equal(validateRubric(rubric,job).questions.length,8);
 assert.throws(()=>validateRubric({...rubric,criteria:[{requirement:'Age',job_quote:'under 30'},...rubric.criteria.slice(1)]},job));
 assert.throws(()=>validateRubric({...rubric,criteria:Array(5).fill(rubric.criteria[0])},job));
 assert.throws(()=>validateRubric({...rubric,questions:Array(8).fill('same')},job));
});
