import { NextResponse } from 'next/server'
import twilio from 'twilio'

export async function POST(req: Request) {
  try {
    const { phone } = await req.json()
    
    if (!phone) {
      return NextResponse.json({ success: false, error: 'מספר טלפון חסר' })
    }

    const client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    )

    await client.messages.create({
      from: process.env.TWILIO_WHATSAPP_FROM!,
      to: `whatsapp:+${phone.replace(/\D/g, '')}`,
      body: '✅ הודעת בדיקה מ-BeautyPro! WhatsApp עובד בהצלחה 🎉'
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message })
  }
}
