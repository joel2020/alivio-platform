BEGIN;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'alivio-auto-followup-daily-9am') THEN
    PERFORM cron.unschedule('alivio-auto-followup-daily-9am');
  END IF;

  PERFORM cron.schedule(
    'alivio-auto-followup-daily-9am',
    '0 9 * * *',
    $job$
    SELECT net.http_post(
      url := current_setting('app.settings.supabase_url', true) || '/functions/v1/auto-followup',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.scheduler_secret', true)
      ),
      body := '{}'::jsonb
    );
    $job$
  );
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'alivio-email-pipeline-30min') THEN
    PERFORM cron.unschedule('alivio-email-pipeline-30min');
  END IF;

  PERFORM cron.schedule(
    'alivio-email-pipeline-30min',
    '*/30 * * * *',
    $job$
    SELECT net.http_post(
      url := current_setting('app.settings.supabase_url', true) || '/functions/v1/email-pipeline',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.scheduler_secret', true)
      ),
      body := '{}'::jsonb
    );
    $job$
  );
END $$;

COMMIT;
