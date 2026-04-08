import Anthropic from "@anthropic-ai/sdk";
import { NextRequest } from "next/server";

export const maxDuration = 60;

const client = new Anthropic();

function buildSystemPrompt(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  // School year: April to March
  const schoolYear = month >= 4 ? year : year - 1;
  const todayStr = now.toISOString().split("T")[0];

  return `あなたは小学校の配布プリント（おたより・学校便り・学年便り）を解析するアシスタントです。
写真に写っているプリントの内容を読み取り、以下の情報を抽出してJSON形式で返してください。
複数枚の写真が送られた場合は、すべての写真の内容をまとめて1つのJSONで返してください。

■ 今日の日付: ${todayStr}
■ 現在の年度: ${schoolYear}年度（${schoolYear}年4月〜${schoolYear + 1}年3月）

■ 日付の変換ルール（重要）:
- すべての日付は必ず YYYY-MM-DD 形式（ISO 8601）で出力してください
- 「4月10日」→ "${schoolYear}-04-10"
- 「4/10」→ "${schoolYear}-04-10"
- 「10日(水)」→ 文脈から月を推測して "${schoolYear}-XX-10"
- 1〜3月の日付は翌年（${schoolYear + 1}年）になります
  例: 「1月15日」→ "${schoolYear + 1}-01-15"
- 4〜12月の日付は今年度（${schoolYear}年）になります
  例: 「9月5日」→ "${schoolYear}-09-05"
- プリントに年が明記されている場合はその年を使用してください
- 曜日が書かれている場合、日付と曜日が一致するか確認してください

出力形式:
{
  "events": [
    {
      "title": "イベント名・行事名",
      "date": "YYYY-MM-DD",
      "time": "HH:MM（わかる場合。不明なら省略）",
      "location": "場所（わかる場合。不明なら省略）",
      "description": "補足情報（あれば）"
    }
  ],
  "items": [
    {
      "name": "持ち物・準備するもの",
      "deadline": "YYYY-MM-DD（いつまでに必要かわかる場合）",
      "note": "補足（サイズ、個数、色指定など）"
    }
  ],
  "notices": ["その他の連絡事項（保護者向けのお知らせなど）"]
}

注意事項:
- 「持ってくるもの」「用意するもの」「準備物」などは items に分類してください
- 持ち物は必ず1アイテムずつ個別に分けてください。「体操服、赤白帽、タオル」のようにまとめず、それぞれ別のitemとして出力してください
  例: ❌ {"name": "体操服・赤白帽・タオル"} → ✅ {"name": "体操服"}, {"name": "赤白帽"}, {"name": "タオル"}
- 連絡事項（notices）にはお知らせ、注意事項、お願いなどをできるだけ詳しく含めてください
- 日付に曜日が括弧で書かれている場合（例: 「10日(水)」「15日（金）」）、曜日は無視して日付の数字のみ使ってください。曜日が間違っている場合があるため、数字だけを信頼してください
- 必ず有効なJSONのみを返してください。説明文は不要です`;
}

/**
 * Normalize a date string to YYYY-MM-DD format.
 * Handles various Japanese date formats that might slip through the AI.
 */
function normalizeDate(dateStr: string): string {
  if (!dateStr) return dateStr;

  // Strip day-of-week info in parentheses: "10日(水)" → "10日", "15日（金）" → "15日"
  const cleaned = dateStr.replace(/[（(][月火水木金土日][）)]/g, "");

  // Already in YYYY-MM-DD format
  if (/^\d{4}-\d{2}-\d{2}$/.test(cleaned)) return cleaned;

  const now = new Date();
  const month = now.getMonth() + 1;
  const schoolYear = month >= 4 ? now.getFullYear() : now.getFullYear() - 1;

  // Match "YYYY年MM月DD日" or "YYYY/MM/DD"
  let m = cleaned.match(/(\d{4})[年/\-.](\d{1,2})[月/\-.](\d{1,2})/);
  if (m) {
    return `${m[1]}-${m[2].padStart(2, "0")}-${m[3].padStart(2, "0")}`;
  }

  // Match "MM月DD日" or "MM/DD"
  m = cleaned.match(/(\d{1,2})[月/](\d{1,2})/);
  if (m) {
    const mon = parseInt(m[1]);
    const day = parseInt(m[2]);
    const year = mon >= 1 && mon <= 3 ? schoolYear + 1 : schoolYear;
    return `${year}-${String(mon).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  }

  return cleaned;
}

type ImageContent = {
  type: "image";
  source: { type: "base64"; media_type: "image/jpeg" | "image/png" | "image/gif" | "image/webp"; data: string };
};
type TextContent = { type: "text"; text: string };

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const images: { base64: string; mimeType: string }[] = body.images
      ? body.images
      : body.image
        ? [{ base64: body.image, mimeType: body.mimeType }]
        : [];

    if (images.length === 0) {
      return Response.json({ error: "画像が提供されていません" }, { status: 400 });
    }

    const content: (ImageContent | TextContent)[] = [];
    for (const img of images) {
      content.push({
        type: "image",
        source: {
          type: "base64",
          media_type: (img.mimeType || "image/jpeg") as ImageContent["source"]["media_type"],
          data: img.base64,
        },
      });
    }
    content.push({
      type: "text",
      text: images.length > 1
        ? `${images.length}枚のプリントの内容をまとめて解析してください。`
        : "このプリントの内容を解析してください。",
    });

    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 4096,
      messages: [{ role: "user", content }],
      system: buildSystemPrompt(),
    });

    const textContent = response.content.find((c) => c.type === "text");
    if (!textContent || textContent.type !== "text") {
      return Response.json({ error: "解析結果を取得できませんでした" }, { status: 500 });
    }

    const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return Response.json({ error: "JSON形式の結果を取得できませんでした", raw: textContent.text }, { status: 500 });
    }

    const result = JSON.parse(jsonMatch[0]);

    // Normalize dates and add IDs
    const events = (result.events || []).map((e: Record<string, unknown>, i: number) => {
      const rawDate = String(e.date || "");
      const normalized = normalizeDate(rawDate);
      if (rawDate !== normalized) {
        console.log(`[Date Normalize] event "${e.title}": "${rawDate}" → "${normalized}"`);
      }
      return { ...e, date: normalized, id: `event-${i}` };
    });

    const items = (result.items || []).map((item: Record<string, unknown>, i: number) => {
      const rawDeadline = String(item.deadline || "");
      const normalized = rawDeadline ? normalizeDate(rawDeadline) : undefined;
      if (rawDeadline && rawDeadline !== normalized) {
        console.log(`[Date Normalize] item "${item.name}": "${rawDeadline}" → "${normalized}"`);
      }
      return { ...item, deadline: normalized, id: `item-${i}`, checked: false };
    });

    return Response.json({
      events,
      items,
      notices: result.notices || [],
    });
  } catch (error) {
    console.error("Analysis error:", error);
    let message = "解析中にエラーが発生しました";
    if (error instanceof Error) {
      if (error.message.includes("quota") || error.message.includes("exceeded")) {
        message = "APIの利用上限に達しました。しばらく時間を置いてから再度お試しください。（目安：1分ほど）";
      } else if (error.message.includes("rate")) {
        message = "リクエストが多すぎます。少し時間を置いてから再度お試しください。";
      } else if (error.message.includes("auth") || error.message.includes("key")) {
        message = "APIキーが無効です。設定を確認してください。";
      } else {
        message = error.message;
      }
    }
    return Response.json({ error: message }, { status: 500 });
  }
}
