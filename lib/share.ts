import LZString from "lz-string";
import type { AnalysisResult } from "./types";

interface ShareData {
  title: string;
  childName?: string;
  result: AnalysisResult;
}

export function encodeShareData(data: ShareData): string {
  const json = JSON.stringify(data);
  return LZString.compressToEncodedURIComponent(json);
}

export function decodeShareData(encoded: string): ShareData | null {
  try {
    const json = LZString.decompressFromEncodedURIComponent(encoded);
    if (!json) return null;
    return JSON.parse(json) as ShareData;
  } catch {
    return null;
  }
}

export function buildShareUrl(baseUrl: string, data: ShareData): string {
  const encoded = encodeShareData(data);
  return `${baseUrl}/share?d=${encoded}`;
}
