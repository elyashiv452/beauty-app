import { NextResponse } from 'next/server'
import twilio from 'twilio'
import { supabase } from '@/lib/supabase'

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!
)

const TIPS = [
  { cat: 'סושיאל', body: '📸 העלי היום לפני/אחרי לאינסטגרם עם #איפור_כלות #מאפרת_מקצועית — זה מביא הכי הרבה פניות חדשות!' },
  { cat: 'לקוחות', body: '💌 שלחי הודעה ללקוחות ישנות: "היי [שם], חשבתי עלייך — יש לי תאריכים פנויים לקראת הסתיו 🌸"' },
  { cat: 'תוכן', body: '🎬 צלמי ריל של 15 שניות עם טכניקה מקצועית — ריל מקבל פי 3 צפיות מפוסט רגיל!' },
  { cat: 'שיתוף פעולה', body: '🤝 שלחי DM ל-2 צלמות חתונות שאת אוהבת — שיתוף פעולה הוא מקור ההמלצות הכי חזק' },
  { cat: 'מוניטין', body: '⭐ בקשי חוות דעת בגוגל מלקוחה מרוצה — כל ביקורת שווה כ-3 לקוחות חדשים!' },
  { cat: 'מבצע', body: '🎯 פרסמי סטורי: "נפתחו 2 מקומות לשבוע הקרוב — מי נכנסת? ✨" עם מדבקת שאלה' },
  { cat: 'תוכן מקצועי', body: '💡 שתפי טיפ לטיפוח עור לפני האירוע — תוכן כזה ממצב אותך כמומחית ומביא שיתופים' },
]

async function sendWhatsApp(to: string, body: string) {
  return client.messages.create({
    from: process.env.TWILIO_WHATSAPP_FROM!,
    to: `whatsapp:${to}`,
    body,
  })
}

export async function POST() {
  try {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const tomorrowStr = tomorrow.toISOString().split('T')[0]
    const tomorrowFormatted = tomorrow.toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long' })

    const { data: appointments } = await supabase
      .from('appointments')
      .select('*')
      .eq('date', tomorrowStr)
      .order('time')

    const ownerPhone = process.env.OWNER_PHONE!.replace('whatsapp:', '')

    if (!appointments || appointments.length === 0) {
      const tip = TIPS[new Date().getDay() % TIPS.length]
      await sendWhatsApp(ownerPhone,
        `✨ יום חופשי מחר — ${tomorrowFormatted}\n\nטיפ קידום עסקי — ${tip.cat}:\n${tip.body}`
      )
      return NextResponse.json({ sent: 'tip' })
    }

    const totalBalance = appointments.reduce((s: number, a: Record<string, number>) =>
      s + (a.total_amount - a.paid_amount), 0)

    const aptLines = appointments.map((a: Record<string, unknown>, i: number) =>
      `אירוע ${i + 1} — ${a.time}\n👤 ${a.client_name} · ${a.client_type === 'bride' ? 'כלה' : 'מלווה'}\n📍 ${a.location || 'לא צוין'}\n💰 ${(a.total_amount as number) - (a.paid_amount as number) > 0 ? `לגביה: ₪${(a.total_amount as number) - (a.paid_amount as number)}` : 'שולם מלא ✓'}`
    ).join('\n\n')

    await sendWhatsApp(ownerPhone,
      `✦ סיכום מחר — ${tomorrowFormatted}\n\n${aptLines}\n\nסה"כ: ${appointments.length} אירועים · ₪${totalBalance.toLocaleString()} לגביה`
    )

    for (const apt of appointments as Record<string, unknown>[]) {
      const phone = (apt.phone as string).replace(/\D/g, '').replace(/^0/, '972')
      await sendWhatsApp(phone,
        `היי ${(apt.client_name as string).split(' ')[0]}! 🌸\n\nמחכה לך מחר לאירוע המיוחד ✨\n\n📅 ${tomorrowFormatted}\n🕐 הגעה שלי: ${apt.time}\n📍 ${apt.location || 'כפי שסוכם'}\n\nאשמח לאישור — השעה והמיקום מתאימים? 😊`
      )
    }

    return NextResponse.json({ sent: 'summary', count: appointments.length })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
