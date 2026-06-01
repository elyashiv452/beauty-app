'use client'
import { useEffect, useState } from 'react'
import { Clock, Calendar, MapPin, Phone, CreditCard, Sparkles, CheckCircle2, Send } from 'lucide-react'
import { Card, Badge, Button } from '@/components/ui'
import { EVENT_LABELS, CLIENT_TYPE_LABELS, formatCurrency } from '@/lib/utils'

const TIPS = [
  { cat: 'סושיאל', icon: '📸', title: 'העלי תמונת לפני/אחרי לאינסטגרם', body: 'תמונת לפני/אחרי היא הסוג של תוכן שמביא הכי הרבה פניות חדשות. הוסיפי #איפור_כלות #מאפרת_מקצועית #איפור_תל_אביב', action: 'העלאת סטורי + פוסט' },
  { cat: 'לקוחות', icon: '💌', title: 'שלחי הודעה ללקוחות ישנות', body: 'יש לך לקוחות שלא חזרו חצי שנה+. שלחי להן: "היי [שם], חשבתי עלייך — יש לי תאריכים פנויים לקראת הסתיו 🌸"', action: 'שלחי ל-3 לקוחות' },
  { cat: 'תוכן', icon: '🎬', title: 'צלמי ריל של טכניקה מקצועית', body: 'ריל של 15 שניות שמראה טכניקה אחת — למשל "איך יוצרים עיניים שקדיות ב-60 שניות" — מקבל פי 3 צפיות מפוסט רגיל.', action: 'צלמי ריל אחד היום' },
  { cat: 'שיתופי פעולה', icon: '🤝', title: 'צרי קשר עם צלמת/מעצבת', body: 'צלמות חתונות מחפשות תמיד מאפרות לשתף פעולה. שלחי ל-2 צלמות שאת אוהבת את העבודה שלהן הודעה קצרה ב-DM.', action: 'DM ל-2 צלמות' },
  { cat: 'מוניטין', icon: '⭐', title: 'בקשי חוות דעת בגוגל', body: 'כל ביקורת בגוגל שווה כ-3 לקוחות חדשים. בחרי לקוחה מרוצה ושלחי: "תוכלי לעזור לי ולכתוב ביקורת קצרה? 🙏"', action: 'בקשי ביקורת מ-1 לקוחה' },
  { cat: 'מבצע', icon: '🎯', title: 'פרסמי תורים פנויים', body: 'פרסמי סטורי: "נפתחו 2 מקומות אחרונים לשבוע הקרוב — מי נכנסת? ✨" הוסיפי מדבקת שאלה לקבלת פניות.', action: 'סטורי עם מדבקת תגובה' },
  { cat: 'תוכן מקצועי', icon: '💡', title: 'שתפי טיפ לטיפוח עור', body: 'שתפי טיפ מקצועי אחד — למשל "3 דברים לעשות 48 שעות לפני החתונה כדי שהאיפור יחזיק יותר". זה ממצב אותך כמומחית.', action: 'פוסט טיפ מקצועי' },
]

interface Appointment {
  id: string
  client_name: string
  phone: string
  time: string
  event_type: string
  client_type: string
  location: string
  companions: number
  total_amount: number
  paid_amount: number
  confirmed: boolean
}

interface SummaryData {
  type: 'summary' | 'tip'
  date?: string
  appointments?: Appointment[]
  totalRevenue?: number
}

export default function DailySummaryPage() {
  const [data, setData] = useState<SummaryData | null>(null)
  const [tipIndex, setTipIndex] = useState(0)
  const [sent, setSent] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/daily-summary').then(r => r.json()).then(d => {
      setData(d)
      setTipIndex(new Date().getDay())
      setLoading(false)
    })
  }, [])

  function markSent(id: string) {
    setSent(prev => ({ ...prev, [id]: true }))
  }

  function buildMakeupMessage(apt: Appointment) {
    return encodeURIComponent(
      `היי ${apt.client_name}! 🌸\n\nמחכה לך מחר לאירוע המיוחד ✨\n\n` +
      `📅 ${new Date(data?.date || '').toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long' })}\n` +
      `🕐 הגעה שלי: ${apt.time}\n` +
      `📍 ${apt.location || 'כפי שסוכם'}\n\n` +
      `אשמח לאישור — השעה והמיקום מתאימים? 😊`
    )
  }

  function buildOwnerSummary() {
    if (!data?.appointments?.length) return ''
    const lines = data.appointments.map((apt, i) =>
      `אירוע ${i + 1} — ${apt.time}\n` +
      `${apt.client_name} · ${CLIENT_TYPE_LABELS[apt.client_type as keyof typeof CLIENT_TYPE_LABELS] || apt.client_type}\n` +
      `📍 ${apt.location || 'לא צוין'}\n` +
      `💰 ${apt.total_amount > 0 ? `יתרה: ₪${apt.total_amount - apt.paid_amount}` : 'תשלום מלא ✓'}\n`
    ).join('\n')
    return encodeURIComponent(
      `סיכום מחר ✦\n\n${lines}\n` +
      `סה"כ: ${data.appointments.length} אירועים · ₪${data.totalRevenue?.toLocaleString()}`
    )
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const tip = TIPS[tipIndex % TIPS.length]
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const tomorrowFormatted = tomorrow.toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <div className="space-y-5 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">סיכום יומי</h1>
          <p className="text-gray-500 text-sm">נשלח אוטומטית ב-18:00 כל יום</p>
        </div>
        <div className="flex items-center gap-2 bg-teal-50 border border-teal-200 rounded-lg px-3 py-1.5">
          <Clock size={14} className="text-teal-600" />
          <span className="text-sm text-teal-700 font-medium">18:00</span>
        </div>
      </div>

      {data?.type === 'tip' ? (
        /* ── יום ריק ── */
        <div className="space-y-4">
          <Card className="border-amber-100 bg-amber-50/30">
            <div className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={16} className="text-amber-500" />
                <span className="font-medium text-amber-800">אין אירועים מחר — {tomorrowFormatted}</span>
              </div>
              <p className="text-sm text-amber-700">יום חופשי = הזדמנות לקדם את העסק! הנה הטיפ של היום:</p>
            </div>
          </Card>

          <Card>
            <div className="p-5">
              <div className="flex items-start gap-4">
                <div className="text-3xl">{tip.icon}</div>
                <div className="flex-1">
                  <div className="text-xs font-medium text-teal-600 mb-1">{tip.cat}</div>
                  <div className="font-semibold text-gray-900 mb-2">{tip.title}</div>
                  <p className="text-sm text-gray-600 leading-relaxed mb-3">{tip.body}</p>
                  <div className="bg-teal-50 rounded-lg px-3 py-2 text-xs text-teal-700 font-medium">
                    📲 פעולה מוצעת: {tip.action}
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <div className="flex gap-2 flex-wrap">
            {TIPS.map((t, i) => (
              <button key={i} onClick={() => setTipIndex(i)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${i === tipIndex % TIPS.length ? 'bg-teal-600 text-white border-teal-600' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
                {t.icon} {t.cat}
              </button>
            ))}
          </div>
        </div>
      ) : (
        /* ── יש אירועים ── */
        <div className="space-y-4">
          <Card className="border-teal-100 bg-teal-50/20">
            <div className="p-4 flex items-center justify-between">
              <div>
                <div className="font-medium text-teal-800">{tomorrowFormatted}</div>
                <div className="text-sm text-teal-600">{data?.appointments?.length} אירועים · {formatCurrency(data?.totalRevenue || 0)} לגביה</div>
              </div>
              <a href={`https://wa.me/?text=${buildOwnerSummary()}`} target="_blank" rel="noreferrer">
                <Button variant="primary">
                  <Send size={14} /> שלחי לעצמך
                </Button>
              </a>
            </div>
          </Card>

          {data?.appointments?.map((apt) => (
            <Card key={apt.id}>
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-gray-900">{apt.client_name}</span>
                      <Badge variant={apt.client_type === 'bride' ? 'pink' : 'purple'}>
                        {CLIENT_TYPE_LABELS[apt.client_type as keyof typeof CLIENT_TYPE_LABELS] || apt.client_type}
                      </Badge>
                      <Badge variant="gray">{EVENT_LABELS[apt.event_type as keyof typeof EVENT_LABELS] || apt.event_type}</Badge>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-500">
                      <span className="flex items-center gap-1"><Clock size={13} />{apt.time}</span>
                      {apt.location && <span className="flex items-center gap-1"><MapPin size={13} />{apt.location}</span>}
                    </div>
                  </div>
                  {apt.confirmed
                    ? <Badge variant="green">אושר ✓</Badge>
                    : <Badge variant="amber">ממתין לאישור</Badge>
                  }
                </div>

                <div className="grid grid-cols-3 gap-3 bg-gray-50 rounded-lg p-3 mb-3 text-center text-sm">
                  <div><div className="text-xs text-gray-400 mb-0.5">מלוות</div><div className="font-medium">{apt.companions}</div></div>
                  <div><div className="text-xs text-gray-400 mb-0.5">סה"כ</div><div className="font-medium">{formatCurrency(apt.total_amount)}</div></div>
                  <div><div className="text-xs text-gray-400 mb-0.5">לגביה</div><div className={`font-medium ${apt.total_amount - apt.paid_amount > 0 ? 'text-amber-600' : 'text-green-600'}`}>{formatCurrency(apt.total_amount - apt.paid_amount)}</div></div>
                </div>

                <div className="flex gap-2">
                  <a href={`https://wa.me/972${apt.phone.replace(/\D/g, '').replace(/^0/, '')}?text=${buildMakeupMessage(apt)}`}
                    target="_blank" rel="noreferrer" className="flex-1"
                    onClick={() => markSent(apt.id)}>
                    <Button variant={sent[apt.id] ? 'secondary' : 'primary'} className="w-full">
                      {sent[apt.id]
                        ? <><CheckCircle2 size={14} /> נשלח</>
                        : <><Send size={14} /> שלחי תזכורת ל{apt.client_name.split(' ')[0]}</>
                      }
                    </Button>
                  </a>
                  <a href={`tel:${apt.phone}`}>
                    <Button variant="secondary"><Phone size={14} /></Button>
                  </a>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
