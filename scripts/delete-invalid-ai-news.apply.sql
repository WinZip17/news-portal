-- Удаление найденных invalid AI news + связанных likes/favorites.
-- Перед DELETE выполняется тот же отбор, что в preview.sql.

CREATE TEMP TABLE IF NOT EXISTS invalid_ai_news_ids ON COMMIT DROP AS
SELECT n.id
FROM news n
WHERE n."isAiGenerated" = true
  AND (
    concat_ws(' ', n.title, n.summary, regexp_replace(n.content, '<[^>]+>', ' ', 'g')) ~* 'рерайт[[:space:]]+невозмож'
    OR concat_ws(' ', n.title, n.summary, regexp_replace(n.content, '<[^>]+>', ' ', 'g')) ~* 'отсутствует[[:space:]]+исходн'
    OR concat_ws(' ', n.title, n.summary, regexp_replace(n.content, '<[^>]+>', ' ', 'g')) ~* 'не[[:space:]]+удалось[[:space:]]+создать'
    OR concat_ws(' ', n.title, n.summary, regexp_replace(n.content, '<[^>]+>', ' ', 'g')) ~* 'недостаточно[[:space:]]+данных'
    OR concat_ws(' ', n.title, n.summary, regexp_replace(n.content, '<[^>]+>', ' ', 'g')) ~* 'не[[:space:]]+был[[:space:]]+передан[[:space:]]+текст'
    OR concat_ws(' ', n.title, n.summary, regexp_replace(n.content, '<[^>]+>', ' ', 'g')) ~* 'необходимо[[:space:]]+предоставить'
    OR concat_ws(' ', n.title, n.summary, regexp_replace(n.content, '<[^>]+>', ' ', 'g')) ~* 'контент[[:space:]]+находится[[:space:]]+в[[:space:]]+процессе[[:space:]]+генерации'
    OR concat_ws(' ', n.title, n.summary, regexp_replace(n.content, '<[^>]+>', ' ', 'g')) ~* 'временно[[:space:]]+недоступ'
    OR concat_ws(' ', n.title, n.summary, regexp_replace(n.content, '<[^>]+>', ' ', 'g')) ~* 'provide[[:space:]]+the[[:space:]]+original'
    OR concat_ws(' ', n.title, n.summary, regexp_replace(n.content, '<[^>]+>', ' ', 'g')) ~* 'source[[:space:]]+text[[:space:]]+(is[[:space:]]+)?missing'
    OR concat_ws(' ', n.title, n.summary, regexp_replace(n.content, '<[^>]+>', ' ', 'g')) ~* 'cannot[[:space:]]+rewrite'
    OR concat_ws(' ', n.title, n.summary, regexp_replace(n.content, '<[^>]+>', ' ', 'g')) ~* 'unable[[:space:]]+to[[:space:]]+rewrite'
    OR (
      coalesce(n.tags, '') ~* '(^|,)(ошибка|error|недостаточно данных|insufficient data)(,|$)'
      AND concat_ws(' ', n.title, n.summary) ~* 'рерайт|передан|не[[:space:]]+удалось|невозмож|исходн|предоставить|недостаточно'
    )
  );

BEGIN;

SELECT count(*) AS will_delete FROM invalid_ai_news_ids;

DELETE FROM favorites f
USING invalid_ai_news_ids i
WHERE f."newsId" = i.id;

DELETE FROM likes l
USING invalid_ai_news_ids i
WHERE l."newsId" = i.id;

DELETE FROM news n
USING invalid_ai_news_ids i
WHERE n.id = i.id;

COMMIT;

SELECT 'done' AS status;
