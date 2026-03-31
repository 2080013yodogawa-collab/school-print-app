import { google } from "googleapis";
import { NextRequest } from "next/server";

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI || "http://localhost:3000/api/calendar/callback"
);

// GET: Generate auth URL or check auth status
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const action = searchParams.get("action");

  if (action === "auth-url") {
    const url = oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: ["https://www.googleapis.com/auth/calendar.events"],
    });
    return Response.json({ url });
  }

  return Response.json({ status: "ok" });
}

// POST: Add events to Google Calendar
export async function POST(request: NextRequest) {
  try {
    const { events, accessToken } = await request.json();

    if (!accessToken) {
      return Response.json({ error: "認証が必要です" }, { status: 401 });
    }

    oauth2Client.setCredentials({ access_token: accessToken });
    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

    const results = [];
    for (const event of events) {
      const startDate = event.date;
      const hasTime = !!event.time;

      const calendarEvent: {
        summary: string;
        location?: string;
        description?: string;
        start: { dateTime?: string; date?: string; timeZone: string };
        end: { dateTime?: string; date?: string; timeZone: string };
      } = {
        summary: event.title,
        location: event.location,
        description: event.description,
        start: hasTime
          ? { dateTime: `${startDate}T${event.time}:00`, timeZone: "Asia/Tokyo" }
          : { date: startDate, timeZone: "Asia/Tokyo" },
        end: hasTime
          ? { dateTime: `${startDate}T${event.time}:00`, timeZone: "Asia/Tokyo" }
          : { date: startDate, timeZone: "Asia/Tokyo" },
      };

      const result = await calendar.events.insert({
        calendarId: "primary",
        requestBody: calendarEvent,
      });

      results.push({ id: result.data.id, title: event.title, status: "created" });
    }

    return Response.json({ results });
  } catch (error) {
    console.error("Calendar error:", error);
    const message = error instanceof Error ? error.message : "カレンダー登録中にエラーが発生しました";
    return Response.json({ error: message }, { status: 500 });
  }
}
