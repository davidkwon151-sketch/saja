// 최근에 보여 준 명언·격언 id를 브라우저에 기억해, 다음 결과에서 같은 문장이 반복되지 않게 한다.
// 서버 렌더링·개인정보 보호 모드·저장소 차단에서도 앱이 멈추지 않도록 모든 접근을 try/catch로 감싼다.

export const RECENT_QUOTES_KEY = "career-compass-recent-quotes";
export const RECENT_QUOTES_LIMIT = 20;

type StorageLike = Pick<Storage, "getItem" | "setItem">;

function storage(): StorageLike | null {
  try {
    const candidate = (globalThis as { localStorage?: StorageLike }).localStorage;
    return candidate && typeof candidate.getItem === "function" ? candidate : null;
  } catch {
    return null;
  }
}

function sanitize(ids: unknown): string[] {
  if (!Array.isArray(ids)) return [];
  return ids.filter((id): id is string => typeof id === "string" && id.length > 0 && id.length <= 80);
}

export function readRecentQuoteIds(): string[] {
  try {
    const raw = storage()?.getItem(RECENT_QUOTES_KEY);
    if (!raw) return [];
    return sanitize(JSON.parse(raw)).slice(-RECENT_QUOTES_LIMIT);
  } catch {
    return [];
  }
}

export function rememberQuoteIds(ids: string[]): void {
  try {
    const store = storage();
    if (!store) return;
    const incoming = sanitize(ids);
    if (incoming.length === 0) return;
    const next = [...readRecentQuoteIds().filter((id) => !incoming.includes(id)), ...incoming].slice(-RECENT_QUOTES_LIMIT);
    store.setItem(RECENT_QUOTES_KEY, JSON.stringify(next));
  } catch {
    // 저장하지 못해도 결과 표시에는 영향이 없다.
  }
}
