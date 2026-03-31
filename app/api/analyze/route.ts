import Anthropic from "@anthropic-ai/sdk";
import { NextRequest } from "next/server";

export const maxDuration = 60;

const client = new Anthropic();

const SYSTEM_PROMPT = `あなたは小学校の配布プリント（おたより・学校便り・学年便り）を解析するアシスタントです。
写真に写っているプリントの内容を読み取り、以下の情報を抽出してJSON形式で返してください。

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
- 日付が「○月○日」のように年が書かれていない場合、現在の年度から推測してください（4月〜3月が1年度）
- 曜日の情報があれば、日付の正確性を確認してください
- 「持ってくるもの」「用意するもの」「準備物」などは items に分類してください
- 必ず有効なJSONのみを返してください。説明文は不要です`;

export async function POST(request: NextRequest) {
  try {
    const { image, mimeType } = await request.json();

    if (!image) {
      return Response.json({ error: "画像が提供されていません" }, { status: 400 });
    }

    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 4096,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mimeType || "image/jpeg",
                data: image,
              },
            },
            {
              type: "text",
              text: "このプリントの内容を解析してください。",
            },
          ],
        },
      ],
      system: SYSTEM_PROMPT,
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

    // Add IDs to events and items
    const events = (result.events || []).map((e: Record<string, unknown>, i: number) => ({
      ...e,
      id: `event-${i}`,
    }));
    const items = (result.items || []).map((item: Record<string, unknown>, i: number) => ({
      ...item,
      id: `item-${i}`,
      checked: false,
    }));

    return Response.json({
      events,
      items,
      notices: result.notices || [],
    });
  } catch (error) {
    console.error("Analysis error:", error);
    const message = error instanceof Error ? error.message : "解析中にエラーが発生しました";
    return Response.json({ error: message }, { status: 500 });
  }
}
