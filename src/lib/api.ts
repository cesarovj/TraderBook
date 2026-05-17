import { Trade } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export async function checkImport(fileHash: string): Promise<{ exists: boolean }> {
  const res = await fetch(`${API_URL}/api/imports/check/${fileHash}`);
  if (!res.ok) throw new Error("Backend unreachable");
  return res.json();
}

export async function saveImport(
  filename: string,
  fileHash: string,
  trades: Trade[]
): Promise<void> {
  const res = await fetch(`${API_URL}/api/imports`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ filename, fileHash, trades }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || "Failed to save import");
  }
}

export async function fetchAllTrades(): Promise<Trade[]> {
  const res = await fetch(`${API_URL}/api/imports/trades`);
  if (!res.ok) throw new Error("Failed to fetch trades");
  const raw: Array<Trade & { _id?: string }> = await res.json();
  return raw.map(({ _id, ...t }) => ({
    ...t,
    entryDateTime: new Date(t.entryDateTime),
    exitDateTime: new Date(t.exitDateTime),
  }));
}

export async function hashContent(content: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(content);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
