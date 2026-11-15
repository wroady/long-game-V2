-- The every-minute reminder timer logs one row per run (35k+ rows and growing). Keep two days.
select cron.schedule('cron-history-cleanup', '10 7 * * *', $$ delete from cron.job_run_details where end_time < now() - interval '2 days' $$);
delete from cron.job_run_details where end_time < now() - interval '2 days';
