import { adminClient, rpcError } from './application-runtime.ts';
import { callAiWithFallback } from './ai.ts';
import { ASSESSMENT_PROMPT, RUBRIC_PROMPT, ASSESSMENT_VERSION, validateAssessment, validateRubric } from './interview-assessment.ts';
import { extractResume } from './interview-resume.ts';
import { RESUME_BUCKET, sha256 } from './application-validation.ts';

// Called only after the existing email worker authenticates the privileged scheduler.
export async function processInterviewAssessments() {
  if (Deno.env.get('APPLICATION_AI_INTERVIEWS_ENABLED') !== 'true') return;
  const db = adminClient();
  const claimed = await db.rpc('ats_claim_assessments'); rpcError(claimed.error);
  for (const review of claimed.data || []) {
    let stage = 'resume';
    try {
      if (review.job_snapshot.length > 40000) throw new Error('job_requires_manual_review');
      const application = await db.from('applications').select('resume_path,resume_filename').eq('id', review.application_id).single(); rpcError(application.error);
      if (!application.data) throw new Error('missing_application');
      const file = await db.storage.from(RESUME_BUCKET).download(application.data.resume_path); rpcError(file.error);
      if (!file.data) throw new Error('missing_resume');
      const resume = await extractResume(new Uint8Array(await file.data.arrayBuffer()), application.data.resume_filename);
      stage = 'rubric';
      const snapshotHash = await sha256(`${ASSESSMENT_VERSION}:${review.job_snapshot}`);
      let cached = await db.from('application_job_rubrics').select('rubric').eq('snapshot_hash', snapshotHash).maybeSingle(); rpcError(cached.error);
      if (!cached.data) {
        const generated = await callAiWithFallback({ systemPrompt: RUBRIC_PROMPT, prompt: JSON.stringify({ job: review.job_snapshot }), temperature: 0, timeoutMs: 25000, maxTokens: 2600, jsonMode: true });
        const rubric = validateRubric(JSON.parse(generated.content), review.job_snapshot);
        const saved = await db.from('application_job_rubrics').upsert({ snapshot_hash: snapshotHash, rubric }, { onConflict: 'snapshot_hash', ignoreDuplicates: true }); rpcError(saved.error);
        cached = await db.from('application_job_rubrics').select('rubric').eq('snapshot_hash', snapshotHash).single(); rpcError(cached.error);
      }
      if (!cached.data) throw new Error('missing_rubric');
      const rubric = validateRubric(cached.data.rubric, review.job_snapshot);
      stage = 'assessment';
      const generated = await callAiWithFallback({ systemPrompt: ASSESSMENT_PROMPT, prompt: JSON.stringify({ criteria: rubric.criteria, resume }), temperature: 0, timeoutMs: 25000, maxTokens: 2600, jsonMode: true });
      const assessment = validateAssessment(JSON.parse(generated.content), resume);
      const saved = await db.from('application_ai_reviews').update({ state: 'review', score: assessment.score, assessment, rubric,
        model: generated.model, prompt_version: ASSESSMENT_VERSION, assessed_at: new Date().toISOString(), last_error: null, lease_until: null })
        .eq('application_id', review.application_id).eq('lease_token', review.lease_token).eq('state', 'processing'); rpcError(saved.error);
    } catch (error) {
      // Never persist provider payloads or résumé text in error logs; no guessed scores.
      const message = error instanceof Error ? error.message : '';
      const code = /^(Azure OpenAI HTTP \d{3}|Missing Azure OpenAI environment variables|resume_requires_manual_review|invalid_rubric|invalid_assessment|invalid_ai_result|ungrounded_job_requirement|ungrounded_resume_evidence)$/.test(message) ? message : 'verification_failed';
      await db.from('application_ai_reviews').update({ state: review.attempts < 3 ? 'queued' : 'manual_review',
        last_error: `Review the original résumé. ${stage}: ${code}`, lease_until: null })
        .eq('application_id', review.application_id).eq('lease_token', review.lease_token).eq('state', 'processing');
    }
  }
}

export async function cleanInterviewRecordings() {
  const db = adminClient();
  // Cascading application deletion queues object cleanup rather than orphaning private recordings.
  const expired = await db.from('application_interview_answers').select('application_id,question_index')
    .lt('created_at', new Date(Date.now() - 30 * 86400000).toISOString()).limit(100); rpcError(expired.error);
  for (const answer of expired.data || []) {
    const deleted = await db.from('application_interview_answers').delete().eq('application_id', answer.application_id).eq('question_index', answer.question_index); rpcError(deleted.error);
  }
  const queue = await db.from('application_interview_cleanup').select('path').limit(100); rpcError(queue.error);
  for (const object of queue.data || []) {
    const removed = await db.storage.from('application-interviews').remove([object.path]);
    if (!removed.error) await db.from('application_interview_cleanup').delete().eq('path', object.path);
  }
}
