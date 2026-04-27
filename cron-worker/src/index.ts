// Supabase無料プランは7日間DBアクセスがないと自動一時停止される。
// このワーカーは週1回、実テーブルを1行SELECTして休眠を防ぐ。
// ルート(/rest/v1/)を叩くだけだとDBに触らないため不可。

interface Env {
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
}

export default {
  async scheduled(_event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    ctx.waitUntil(pingSupabase(env));
  },

  // 動作確認用にHTTPでも叩けるようにしておく（手動テスト用）
  async fetch(_req: Request, env: Env): Promise<Response> {
    const result = await pingSupabase(env);
    return new Response(JSON.stringify(result, null, 2), {
      status: result.ok ? 200 : 500,
      headers: { "content-type": "application/json" },
    });
  },
};

async function pingSupabase(env: Env): Promise<{ ok: boolean; status: number; body: string }> {
  const url = `${env.SUPABASE_URL}/rest/v1/families?select=id&limit=1`;
  const res = await fetch(url, {
    headers: {
      apikey: env.SUPABASE_ANON_KEY,
      Authorization: `Bearer ${env.SUPABASE_ANON_KEY}`,
    },
  });
  const body = await res.text();
  const ok = res.ok;
  console.log(`Supabase ping: status=${res.status} ok=${ok} body=${body.slice(0, 200)}`);
  return { ok, status: res.status, body };
}
