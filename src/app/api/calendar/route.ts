import { NextRequest, NextResponse } from 'next/server'
import { google } from 'googleapis'
import path from 'path'

function getCalendar() {
  const auth = new google.auth.GoogleAuth({
    keyFile: path.join(process.cwd(), 'google-calendar-key.json'),
    scopes: ['https://www.googleapis.com/auth/calendar'],
  })
  return google.calendar({ version: 'v3', auth })
}

export async function GET() {
  try {
    const calendar = getCalendar()
    const now = new Date()
    const monthLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
    const res = await calendar.events.list({
      calendarId: process.env.GOOGLE_CALENDAR_ID!,
      timeMin: now.toISOString(),
      timeMax: monthLater.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
    })
    return NextResponse.json({ events: res.data.items || [] })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const calendar = getCalendar()
    const event = await calendar.events.insert({
      calendarId: process.env.GOOGLE_CALENDAR_ID!,
      requestBody: {
        summary: body.summary,
        description: body.description,
        start: { dateTime: body.start, timeZone: 'Asia/Jerusalem' },
        end: { dateTime: body.end, timeZone: 'Asia/Jerusalem' },
        location: body.location,
      },
    })
    return NextResponse.json({ success: true, event: event.data })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
