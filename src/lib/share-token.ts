const OWNER_TOKENS_KEY = "costiq_owner_tokens";

export interface StoredAuditData {
  id: string;
  shareToken: string;
  [key: string]: unknown;
}

export type AccessState =
  | { state: "loading" }
  | { state: "owner-redirect"; redirectTo: string }
  | { state: "unlocked"; data: StoredAuditData }
  | { state: "locked" }
  | { state: "not-found" };

function randomBase36(len: number): string {
  const bytes = new Uint8Array(len);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => (b % 36).toString(36)).join("");
}

export function generateReportId(): string {
  return `costiq_${randomBase36(7)}`;
}

export function generateShareToken(): string {
  return randomBase36(6);
}

export function buildShareUrl(reportId: string, shareToken: string, origin: string): string {
  return `${origin}/report/${reportId}?share=${shareToken}`;
}

export function reportStorageKey(reportId: string): string {
  return `costiq_report_${reportId}`;
}

function readOwnerMap(): Record<string, string> {
  try {
    const raw = sessionStorage.getItem(OWNER_TOKENS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export function rememberOwnerToken(reportId: string, shareToken: string): void {
  try {
    const map = readOwnerMap();
    map[reportId] = shareToken;
    sessionStorage.setItem(OWNER_TOKENS_KEY, JSON.stringify(map));
  } catch {}
}

export function resolveAccess(reportId: string, urlToken: string | null): AccessState {
  let raw: string | null = null;
  try {
    raw = sessionStorage.getItem(reportStorageKey(reportId));
  } catch {
    return { state: "not-found" };
  }
  if (!raw) return { state: "not-found" };

  let parsed: StoredAuditData;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { state: "not-found" };
  }

  if (!parsed || typeof parsed.shareToken !== "string") {
    return { state: "not-found" };
  }

  if (urlToken && urlToken === parsed.shareToken) {
    return { state: "unlocked", data: parsed };
  }

  if (!urlToken) {
    const ownerMap = readOwnerMap();
    const ownedToken = ownerMap[reportId];
    if (ownedToken && ownedToken === parsed.shareToken) {
      return {
        state: "owner-redirect",
        redirectTo: `/report/${reportId}?share=${ownedToken}`,
      };
    }
  }

  return { state: "locked" };
}
