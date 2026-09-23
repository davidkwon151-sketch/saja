-- Google 로그인 사용자의 생성된 해석만 저장합니다. 원본 생년월일과 고민은 저장하지 않습니다.
begin;

create table public.saju_readings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  summary text not null check (char_length(summary) between 1 and 350),
  strengths text[] not null check (cardinality(strengths) = 2),
  cautions text[] not null check (cardinality(cautions) = 2),
  reflection text not null check (char_length(reflection) between 1 and 180)
);

create index saju_readings_user_created_idx
  on public.saju_readings (user_id, created_at desc);

alter table public.saju_readings enable row level security;
revoke all on public.saju_readings from anon, authenticated;
grant select, insert on public.saju_readings to authenticated;

create policy "Users can read own saju readings"
  on public.saju_readings for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can insert own saju readings"
  on public.saju_readings for insert to authenticated
  with check ((select auth.uid()) = user_id);

commit;
