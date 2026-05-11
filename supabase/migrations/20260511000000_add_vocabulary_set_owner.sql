alter table public.vocabulary_sets
  add column if not exists user_id uuid references auth.users(id) on delete set null;

create index if not exists vocabulary_sets_user_id_idx
  on public.vocabulary_sets(user_id);

create extension if not exists pgcrypto with schema extensions;

do $$
declare
  id_identity text;
  id_default text;
begin
  select attidentity, pg_get_expr(adbin, adrelid)
    into id_identity, id_default
  from pg_attribute
  left join pg_attrdef
    on adrelid = attrelid
    and adnum = attnum
  where attrelid = 'public.vocabulary_sets'::regclass
    and attname = 'id'
    and not attisdropped;

  if coalesce(id_identity, '') = '' and id_default is null then
    create sequence if not exists public.vocabulary_sets_id_seq;

    perform setval(
      'public.vocabulary_sets_id_seq',
      coalesce((select max(id) from public.vocabulary_sets), 0) + 1,
      false
    );

    alter table public.vocabulary_sets
      alter column id set default nextval('public.vocabulary_sets_id_seq'::regclass);
  end if;
end $$;

create or replace function public.create_vocabulary_set(
  p_name text,
  p_description text default null,
  p_status text default 'open',
  p_creator text default null,
  p_privacy text default 'public',
  p_password text default null,
  p_user_id uuid default null
)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  inserted_set_id bigint;
begin
  if current_user_id is null then
    raise exception 'not_authenticated';
  end if;

  insert into public.vocabulary_sets (
    name,
    description,
    status,
    creator,
    privacy,
    password_hash,
    user_id
  )
  values (
    nullif(trim(p_name), ''),
    nullif(trim(coalesce(p_description, '')), ''),
    coalesce(nullif(trim(p_status), ''), 'open'),
    nullif(trim(coalesce(p_creator, '')), ''),
    coalesce(nullif(trim(p_privacy), ''), 'public'),
    extensions.crypt(
      nullif(trim(coalesce(p_password, '')), ''),
      extensions.gen_salt('bf')
    ),
    current_user_id
  )
  returning id into inserted_set_id;

  return inserted_set_id;
end;
$$;

create or replace function public.delete_vocabulary_set(
  p_set_id bigint,
  p_password text
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  stored_password_hash text;
begin
  if current_user_id is null then
    return 'not_found';
  end if;

  select password_hash
    into stored_password_hash
  from public.vocabulary_sets
  where id = p_set_id
    and user_id = current_user_id;

  if not found then
    return 'not_found';
  end if;

  if stored_password_hash is null or
    stored_password_hash <> extensions.crypt(p_password, stored_password_hash) then
    return 'wrong_password';
  end if;

  delete from public.vocabulary_sets
  where id = p_set_id
    and user_id = current_user_id;

  return 'ok';
end;
$$;

drop function if exists public.update_vocabulary_set_password(bigint, text);

create or replace function public.update_vocabulary_set_password(
  p_set_id bigint,
  p_new_password text
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
begin
  if current_user_id is null then
    return 'not_found';
  end if;

  update public.vocabulary_sets
  set password_hash = extensions.crypt(
    nullif(trim(p_new_password), ''),
    extensions.gen_salt('bf')
  )
  where id = p_set_id
    and user_id = current_user_id;

  if not found then
    return 'not_found';
  end if;

  return 'ok';
end;
$$;
