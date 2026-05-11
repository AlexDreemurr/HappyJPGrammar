do $$
declare
  sentences_type text;
begin
  select format_type(attribute.atttypid, attribute.atttypmod)
    into sentences_type
  from pg_attribute as attribute
  join pg_class as class on class.oid = attribute.attrelid
  join pg_namespace as namespace on namespace.oid = class.relnamespace
  where namespace.nspname = 'public'
    and class.relname = 'vocabulary'
    and attribute.attname = 'sentences'
    and not attribute.attisdropped;

  if sentences_type = 'text[]' then
    alter table public.vocabulary
      add column sentences_jsonb jsonb not null default '[]'::jsonb;

    update public.vocabulary
    set sentences_jsonb = (
      select coalesce(
        jsonb_agg(
          jsonb_build_object(
            'text',
            sentence_text,
            'target_reading',
            coalesce(public.vocabulary.reading, '')
          )
          order by ordinality
        ),
        '[]'::jsonb
      )
      from unnest(public.vocabulary.sentences) with ordinality as s(sentence_text, ordinality)
    );

    alter table public.vocabulary
      drop column sentences;

    alter table public.vocabulary
      rename column sentences_jsonb to sentences;
  elsif sentences_type = 'json' then
    alter table public.vocabulary
      alter column sentences type jsonb using sentences::jsonb;
  elsif sentences_type <> 'jsonb' then
    raise exception 'Unsupported public.vocabulary.sentences type: %', sentences_type;
  end if;
end $$;
