UPDATE organizations 
SET subscription_renews_at = NOW() + INTERVAL '1 year'
WHERE subscription_renews_at < NOW();
