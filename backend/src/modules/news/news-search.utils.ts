const SORTABLE_COLUMNS = new Set(['publishedAt', 'views', 'likes', 'createdAt']);

const CYRILLIC_TO_LATIN: Record<string, string> = {
  а: 'a',
  б: 'b',
  в: 'v',
  г: 'g',
  д: 'd',
  е: 'e',
  ё: 'e',
  ж: 'zh',
  з: 'z',
  и: 'i',
  й: 'y',
  к: 'k',
  л: 'l',
  м: 'm',
  н: 'n',
  о: 'o',
  п: 'p',
  р: 'r',
  с: 's',
  т: 't',
  у: 'u',
  ф: 'f',
  х: 'kh',
  ц: 'ts',
  ч: 'ch',
  ш: 'sh',
  щ: 'sch',
  ъ: '',
  ы: 'y',
  ь: '',
  э: 'e',
  ю: 'yu',
  я: 'ya',
};

const LATIN_TO_CYRILLIC_DIGRAPHS: Array<[string, string]> = [
  ['sch', 'щ'],
  ['zh', 'ж'],
  ['kh', 'х'],
  ['ts', 'ц'],
  ['ch', 'ч'],
  ['sh', 'ш'],
  ['yu', 'ю'],
  ['ya', 'я'],
  ['yo', 'ё'],
  ['ye', 'е'],
];

const LATIN_TO_CYRILLIC_SINGLE: Record<string, string> = {
  a: 'а',
  b: 'б',
  c: 'к',
  d: 'д',
  e: 'е',
  f: 'ф',
  g: 'г',
  h: 'х',
  i: 'и',
  j: 'дж',
  k: 'к',
  l: 'л',
  m: 'м',
  n: 'н',
  o: 'о',
  p: 'п',
  q: 'к',
  r: 'р',
  s: 'с',
  t: 'т',
  u: 'у',
  v: 'в',
  w: 'в',
  x: 'кс',
  y: 'й',
  z: 'з',
};

/** Common brand / entity spellings in Russian news */
const ENTITY_ALIAS_GROUPS: string[][] = [
  ['ozon', 'Ozon', 'OZON', 'озон', 'Озон', 'ОЗОН'],
  ['sber', 'Sber', 'SBER', 'сбер', 'Сбер', 'СБЕР', 'сбербанк', 'Сбербанк', 'Sberbank'],
  ['yandex', 'Yandex', 'YANDEX', 'яндекс', 'Яндекс', 'ЯНДЕКС'],
  ['wildberries', 'Wildberries', 'WILDBERRIES', 'вайлдберриз', 'Вайлдберриз'],
  ['vk', 'VK', 'вк', 'ВК', 'vkontakte', 'VKontakte', 'вконтакте', 'ВКонтакте'],
  ['telegram', 'Telegram', 'TELEGRAM', 'телеграм', 'Телеграм'],
  ['whatsapp', 'WhatsApp', 'WHATSAPP', 'ватсап', 'Ватсап'],
  ['iphone', 'iPhone', 'IPHONE', 'айфон', 'Айфон'],
  ['tesla', 'Tesla', 'TESLA', 'тесла', 'Тесла'],
  ['google', 'Google', 'GOOGLE', 'гугл', 'Гугл'],
  ['apple', 'Apple', 'APPLE', 'эпл', 'Эпл', 'Apple'],
  ['microsoft', 'Microsoft', 'MICROSOFT', 'майкрософт', 'Майкрософт'],
  ['amazon', 'Amazon', 'AMAZON', 'амазон', 'Амазон'],
  ['meta', 'Meta', 'META', 'мета', 'Мета'],
  ['netflix', 'Netflix', 'NETFLIX', 'нетфликс', 'Нетфликс'],
  ['openai', 'OpenAI', 'OPENAI', 'опенai', 'Open AI'],
  ['chatgpt', 'ChatGPT', 'CHATGPT', 'чатgpt', 'Chat GPT'],
];

export function normalizeTagsFilter(tags?: string | string[]): string[] | undefined {
  if (!tags) return undefined;

  const list = (Array.isArray(tags) ? tags : tags.split(',')).map((tag) => tag.trim().toLowerCase()).filter(Boolean);

  return list.length > 0 ? list : undefined;
}

export function resolveSortColumn(sortBy?: string): 'publishedAt' | 'views' | 'likes' | 'createdAt' {
  if (sortBy && SORTABLE_COLUMNS.has(sortBy)) {
    return sortBy as 'publishedAt' | 'views' | 'likes' | 'createdAt';
  }
  return 'publishedAt';
}

function normalizeLookupTerm(term: string): string {
  return term.toLowerCase().replace(/[^a-zа-яё0-9]/gi, '');
}

function containsCyrillic(value: string): boolean {
  return /[а-яё]/i.test(value);
}

function containsLatin(value: string): boolean {
  return /[a-z]/i.test(value);
}

function dedupeTerms(terms: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const term of terms) {
    const trimmed = term.trim();
    if (!trimmed) continue;

    const key = normalizeLookupTerm(trimmed);
    if (seen.has(key)) continue;

    seen.add(key);
    result.push(trimmed.slice(0, 200));
  }

  return result;
}

function transliterateCyrillicToLatin(value: string): string {
  return [...value].map((char) => CYRILLIC_TO_LATIN[char.toLowerCase()] ?? char).join('');
}

function transliterateLatinToCyrillic(value: string): string {
  let rest = value.toLowerCase();
  let result = '';

  while (rest.length > 0) {
    let matched = false;

    for (const [latin, cyrillic] of LATIN_TO_CYRILLIC_DIGRAPHS) {
      if (rest.startsWith(latin)) {
        result += cyrillic;
        rest = rest.slice(latin.length);
        matched = true;
        break;
      }
    }

    if (matched) continue;

    const char = rest[0];
    result += LATIN_TO_CYRILLIC_SINGLE[char] ?? char;
    rest = rest.slice(1);
  }

  return result;
}

function findEntityAliasGroup(term: string): string[] | undefined {
  const normalized = normalizeLookupTerm(term);
  if (!normalized) return undefined;

  for (const group of ENTITY_ALIAS_GROUPS) {
    if (group.some((alias) => normalizeLookupTerm(alias) === normalized)) {
      return group;
    }
  }

  return undefined;
}

export function getWordSearchVariants(word: string): string[] {
  const aliasGroup = findEntityAliasGroup(word);
  if (aliasGroup) {
    return dedupeTerms([word, ...aliasGroup]);
  }

  const variants = new Set<string>([word]);

  if (containsCyrillic(word)) {
    variants.add(transliterateCyrillicToLatin(word));
  }

  if (containsLatin(word)) {
    variants.add(transliterateLatinToCyrillic(word));
  }

  return dedupeTerms([...variants]);
}

function findBestMatchingWordIndex(words: string[], variant: string): number {
  const variantNormalized = normalizeLookupTerm(variant);
  if (!variantNormalized) return -1;

  for (let index = 0; index < words.length; index += 1) {
    const wordVariants = getWordSearchVariants(words[index]);
    if (wordVariants.some((item) => normalizeLookupTerm(item) === variantNormalized)) {
      return index;
    }
  }

  return -1;
}

export function buildSearchWordGroups(search: string, searchVariants?: string[]): string[][] {
  const words = search.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];

  const groups = words.map((word) => getWordSearchVariants(word));
  const extraVariants = dedupeTerms(searchVariants ?? []);

  if (extraVariants.length === 0) {
    return groups.map((group) => dedupeTerms(group));
  }

  if (words.length === 1) {
    return [dedupeTerms([...groups[0], ...extraVariants])];
  }

  for (const variant of extraVariants) {
    const targetIndex = findBestMatchingWordIndex(words, variant);
    const index = targetIndex >= 0 ? targetIndex : words.length - 1;
    groups[index].push(variant);
  }

  return groups.map((group) => dedupeTerms(group));
}

export function buildFtsSearchCondition(search: string, searchVariants?: string[]): { sql: string; params: Record<string, string> } | null {
  const wordGroups = buildSearchWordGroups(search, searchVariants);
  if (wordGroups.length === 0) return null;

  const params: Record<string, string> = {};
  const andParts: string[] = [];

  wordGroups.forEach((variants, groupIndex) => {
    const orParts: string[] = [];

    variants.forEach((variant, variantIndex) => {
      const russianParam = `searchG${groupIndex}R${variantIndex}`;
      const simpleParam = `searchG${groupIndex}S${variantIndex}`;

      params[russianParam] = variant;
      params[simpleParam] = variant;

      orParts.push(`news.search_vector @@ plainto_tsquery('russian', :${russianParam})`);
      orParts.push(`news.search_vector @@ plainto_tsquery('simple', :${simpleParam})`);
    });

    andParts.push(`(${orParts.join(' OR ')})`);
  });

  return {
    sql: andParts.join(' AND '),
    params,
  };
}
