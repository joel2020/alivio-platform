-- RLS policies on candidate_role_matches (and candidate_feedback)
-- reference public.get_user_org_id(), but authenticated lacked EXECUTE
-- on it — any client-side query touching those policies failed with
-- "permission denied for function get_user_org_id".
grant execute on function public.get_user_org_id() to authenticated;
