import { supabase } from './supabase';
export async function interviewRequest<T>(body: Record<string, unknown>): Promise<T> {
 const {data,error}=await supabase.functions.invoke('candidate-interviews',{body});
 if(error || data?.error){
  let message=data?.error || 'Unable to complete this step. Your saved application is unchanged.';
  if(error && 'context' in error && error.context instanceof Response){const payload=await error.context.clone().json().catch(()=>null);if(payload?.error)message=payload.error;}
  throw new Error(message);
 }
 return data.data as T;
}
