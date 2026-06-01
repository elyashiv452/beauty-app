'use client'
import { useEffect, useState } from 'react'
import { Calendar, Clock, MapPin, Users, CheckCircle2, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react'
import { Appointment } from '@/types'
import { Card, Badge, Button, Modal, Input, Select } from '@/components/ui'
import { EVENT_LABELS, CLIENT_TYPE_LABELS, formatDate, formatCurrency } from '@/lib/utils'

function addDays(date: Date, days: number) {
  const d = new Date(date); d.setDate(d.getDate() + days); return d
}
function toISO(d: Date) { return d.toISOString().split('T')[0] }

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [weekStart, setWeekStart] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() - d.getDay() + 0); return d
  })
  const [selected, setSelected] = useState<Appointment | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetch('/api/appointments').then(r => r.json()).then(d => { setAppointments(d); setLoading(false) }) }, [])

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
  const todayStr = toISO(new Date())

  const forDay = (day: Date) => appointments
    .filter(a => a.date === toISO(day))
    .sort((a, b) => a.time.localeCompare(b.time))

  async function toggleConfirm(apt: Appointment) {
    const updated = { ...apt, confirmed: !apt.confirmed }
    await fetch('/api/appointments', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: apt.id, confirmed: updated.confirmed }) })
    setAppointments(prev => prev.map(a => a.id === apt.id ? updated : a))
    if (selected?.id === apt.id) setSelected(updated)
  }

  const dayNames = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש']

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">תורים ולוח זמנים</h1>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={() => setWeekStart(d => addDays(d, -7))}>
            <ChevronRight size={16} />
          </Button>
          <span className="text-sm text-gray-600 min-w-[120px] text-center">
            {weekDays[0].toLocaleDateString('he-IL', { day: 'numeric', month: 'short' })} — {weekDays[6].toLocaleDateString('he-IL', { day: 'numeric', month: 'short' })}
          </span>
          <Button variant="secondary" onClick={() => setWeekStart(d => addDays(d, 7))}>
            <ChevronLeft size={16} />
          </Button>
          <Button variant="ghost" onClick={() => { const d = new Date(); d.setDate(d.getDate() - d.getDay()); setWeekStart(d) }} className="text-xs">
            השבוע
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64"><div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((day, i) => {
            const dayApts = forDay(day)
            const isToday = toISO(day) === todayStr
            const isPast = toISO(day) < todayStr
            return (
              <div key={i} className={`rounded-xl border ${isToday ? 'border-teal-300 bg-teal-50/30' : 'border-gray-100 bg-white'} ${isPast ? 'opacity-60' : ''}`}>
                <div className={`p-2 text-center border-b ${isToday ? 'border-teal-200' : 'border-gray-50'}`}>
                  <div className="text-xs text-gray-500">{dayNames[i]}</div>
                  <div className={`text-lg font-semibold leading-none ${isToday ? 'text-teal-600' : 'text-gray-900'}`}>
                    {day.getDate()}
                  </div>
                  <div className="text-xs text-gray-400">{day.toLocaleDateString('he-IL', { month: 'short' })}</div>
                </div>
                <div className="p-1.5 space-y-1 min-h-[60px]">
                  {dayApts.map(apt => (
                    <button
                      key={apt.id}
                      onClick={() => setSelected(apt)}
                      className={`w-full text-right rounded-lg p-2 text-xs transition-colors ${
                        apt.clientType === 'bride'
                          ? 'bg-pink-50 border border-pink-100 hover:border-pink-300'
                          : 'bg-purple-50 border border-purple-100 hover:border-purple-300'
                      }`}
                    >
                      <div className="font-medium text-gray-900 truncate">{apt.clientName}</div>
                      <div className="text-gray-500 flex items-center gap-0.5">
                        <Clock size={9} />{apt.time}
                      </div>
                      {!apt.confirmed && <AlertCircle size={9} className="text-amber-400 mt-0.5" />}
                    </button>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="p-4">
          <div className="text-xs text-gray-500 mb-1">אירועים השבוע</div>
          <div className="text-2xl font-semibold text-gray-900">
            {weekDays.reduce((s, d) => s + forDay(d).length, 0)}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-gray-500 mb-1">הכנסה צפויה</div>
          <div className="text-2xl font-semibold text-teal-600">
            {formatCurrency(weekDays.flatMap(d => forDay(d)).reduce((s, a) => s + a.totalAmount, 0))}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-xs text-gray-500 mb-1">ממתינים לאישור</div>
          <div className="text-2xl font-semibold text-amber-500">
            {weekDays.flatMap(d => forDay(d)).filter(a => !a.confirmed).length}
          </div>
        </Card>
      </div>

      {/* Appointment detail */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title={selected?.clientName || ''}>
        {selected && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant={selected.clientType === 'bride' ? 'pink' : 'purple'}>{CLIENT_TYPE_LABELS[selected.clientType]}</Badge>
              <Badge variant="gray">{EVENT_LABELS[selected.eventType]}</Badge>
              {selected.confirmed
                ? <Badge variant="green">אושר</Badge>
                : <Badge variant="amber">ממתין לאישור</Badge>
              }
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><div className="text-xs text-gray-400 mb-0.5">תאריך</div><div className="flex items-center gap-1"><Calendar size={13} className="text-gray-400" />{formatDate(selected.date)}</div></div>
              <div><div className="text-xs text-gray-400 mb-0.5">שעה</div><div className="flex items-center gap-1"><Clock size={13} className="text-gray-400" />{selected.time}</div></div>
              {selected.location && <div className="col-span-2"><div className="text-xs text-gray-400 mb-0.5">מיקום</div><div className="flex items-center gap-1"><MapPin size={13} className="text-gray-400" />{selected.location}</div></div>}
              <div><div className="text-xs text-gray-400 mb-0.5">מלוות</div><div className="flex items-center gap-1"><Users size={13} className="text-gray-400" />{selected.companions}</div></div>
              <div><div className="text-xs text-gray-400 mb-0.5">תשלום</div><div className="font-medium">{formatCurrency(selected.totalAmount)}</div></div>
            </div>
            {selected.notes && <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600">{selected.notes}</div>}
            <Button variant={selected.confirmed ? 'secondary' : 'primary'} onClick={() => toggleConfirm(selected)} className="w-full">
              <CheckCircle2 size={14} />
              {selected.confirmed ? 'בטל אישור' : 'סמן כמאושר'}
            </Button>
          </div>
        )}
      </Modal>
    </div>
  )
}
