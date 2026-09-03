-- Удаление AI-новостей с отказом рерайта (сообщения об ошибке вместо материала).
-- Логика совпадает с backend/src/modules/ai/ai-rewrite.validation.ts
--
-- Запускать через scripts/delete-invalid-ai-news.sh (не напрямую).

CREATE TEMP TABLE IF NOT EXISTS invalid_ai_news_ids ON COMMIT DROP AS
SELECT n.id
FROM news n
WHERE n."isAiGenerated" = true
  AND (
    -- Текстовые паттерны отказа AI (title + summary + content)
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
    -- Теги ошибки + подозрительный title/summary
    OR (
      coalesce(n.tags, '') ~* '(^|,)(ошибка|error|недостаточно данных|insufficient data)(,|$)'
      AND concat_ws(' ', n.title, n.summary) ~* 'рерайт|передан|не[[:space:]]+удалось|невозмож|исходн|предоставить|недостаточно'
    )
  );

-- Превью (всегда)
SELECT
  n.id,
  n.status,
  n.title,
  n."publishedAt",
  n.tags
FROM news n
INNER JOIN invalid_ai_news_ids i ON i.id = n.id
ORDER BY n."publishedAt" DESC;

SELECT count(*) AS invalid_news_count FROM invalid_ai_news_ids;
