-- Compact input for the send-reminders function. The app's synced state is one ~900 KB row; downloading
-- all of it every minute used ~39 GB/month of egress and got the project restricted. This returns only
-- what reminders need (device list, plan start, targets, supplements, and each day's workout TITLE).
create or replace function public.reminder_inputs(wk text)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  with s as (select state from app_sync where user_id = 'rodney'),
  p as (
    select state,
           (state->'planWeeks') ? wk as frozen,
           coalesce(state->'planWeeks'->wk, state->'activePlan') as plan
    from s
  )
  select jsonb_build_object(
    'pushSubs', coalesce(state->'pushSubs', '{}'::jsonb),
    'planStartDate', state->'planStartDate',
    'frozen', frozen,
    'plan', case when plan is null then null else jsonb_build_object(
      'targets', plan->'targets',
      'supplements', coalesce(plan->'supplements', '[]'::jsonb),
      'workouts', (select coalesce(jsonb_object_agg(k, jsonb_build_object('title', v->'title')), '{}'::jsonb)
                   from jsonb_each(coalesce(plan->'workouts', '{}'::jsonb)) as e(k, v))
    ) end
  )
  from p;
$$;

revoke all on function public.reminder_inputs(text) from public, anon, authenticated;
grant execute on function public.reminder_inputs(text) to service_role;
