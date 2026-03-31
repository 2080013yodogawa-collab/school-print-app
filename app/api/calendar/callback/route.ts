import { google } from "googleapis";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");

  if (!code) {
    return Response.json({ error: "認証コードがありません" }, { status: 400 });
  }

  try {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI || "http://localhost:3000/api/calendar/callback"
    );

    const { tokens } = await oauth2Client.getToken(code);

    // Redirect back to app with token in hash (client-side only)
    const redirectUrl = new URL("/", request.nextUrl.origin);
    redirectUrl.hash = `access_token=${tokens.access_token}`;

    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error("OAuth callback error:", error);
    return Response.json({ error: "認証に失敗しました" }, { status: 500 });
  }
}
