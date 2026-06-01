'use client'
import { useEffect, useState } from 'react'
import { Calendar, AlertCircle, Clock, MapPin, CheckCircle2 } from 'lucide-react'
import { StatCard, Card, Badge } from '@/components/ui'
import { Appointment } from '@/types'
import { formatCurrency, EVENT_LABELS, CLIENT_TYPE_LABELS } from '@/lib/utils'

interface Stats {
  todayAppointments: number
  todayRevenue: number
  newLeads: number
  pendingLeads: number
  monthRevenue: number
  upcomingWeek: Appointment[]
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  useEffect(() => { fetch('/api/stats').then(r => r.json()).then(setStats) }, [])
  if (!stats) return <div className="flex items-center justify-center h-64"><div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" /></div>
  const today = new Date().toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long' })
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">שלום! ✨</h1>
        <p className="text-gray-500 text-sm mt-0.5">{today}</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="אירועים היום" value={stats.todayAppointments} sub={stats.todayAppointments > 0 ? 'יש לך עבודה היום' : 'יום חופשי'} color={stats.todayAppointments > 0 ? 'teal' : 'gray'} />
        <StatCard label="הכנסה החודש" value={formatCurrency(stats.monthRevenue)} color="teal" />
        <StatCard label="לידים חדשים" value={stats.newLeads} sub="ממתינים לטיפול" color={stats.newLeads > 0 ? 'teal' : 'gray'} />
        <StatCard label="ממתינים למענה" value={stats.pendingLeads} sub="+24ש ללא תגובה" color={stats.pendingLeads > 0 ? 'red' : 'gray'} />
      </div>
      <Card>
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
          <Calendar size={16} className="text-teal-600" />
          <h2 className="font-medium text-gray-900 text-sm">אירועים קרובים — 7 ימים</h2>
        </div>
        {stats.upcomingWeek.length === 0 ? (
          <div className="py-10 text-center text-gray-400 text-sm">אין אירועים קרובים</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {stats.upcomingWeek.map(apt => (
              <div key={apt.id} className="px-5 py-3.5 flex items-center gap-4">
                <div className="text-center min-w-[48px]">
                  <div className="text-xs text-gray-400">{new Date(apt.date).toLocaleDateString('he-IL', { weekday: 'short' })}</div>
                  <div className="text-lg font-semibold text-gray-900 leading-none">{apt.date.split('-')[2]}</div>
                  <div className="text-xs text-gray-400">{new Date(apt.date).toLocaleDateString('he-IL', { month: 'short' })}</div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-medium text-sm text-gray-900">{apt.clientName}</span>
                    <Badge variant={apt.clientType === 'bride' ? 'pink' : 'purple'}>{CLIENT_TYPE_LABELS[apt.clientType]}</Badge>
                    <Badge variant="gray">{EVENT_LABELS[apt.eventType]}</Badge>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1"><Clock size={11} />{apt.time}</span>
                    {apt.location && <span className="flex items-center gap-1"><MapPin size={11} />{apt.location}</span>}
                  </div>
                </div>
                <div className="text-left">
                  <div className="text-sm font-medium text-gray-900">{formatCurrency(apt.totalAmount)}</div>
                  {apt.paymentStatus !== 'full' && <div className="text-xs text-amber-600">יתרה: {formatCurrency(apt.totalAmount - apt.paidAmount)}</div>}
                  {apt.confirmed ? <div className="flex items-center gap-1 text-xs text-green-600 mt-0.5"><CheckCircle2 size={11} /> אושר</div>
                    : <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5"><AlertCircle size={11} /> לא אושר</div>}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
      <Card className="border-teal-100 bg-teal-50/30">
        <div className="px-5 py-4 flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-teal-100 flex items-center justify-center flex-shrink-0">
            <Clock size={16} className="text-teal-600" />
          </div>
          <div>
            <div className="font-medium text-sm text-teal-800">סיכום יומי אוטומטי — 18:00</div>
            <div className="text-xs text-teal-600 mt-0.5">כל יום ב-18:00 תקבלי סיכום אירועי מחר ותישלח תזכורת אוטומטית לכל לקוחה.{stats.upcomingWeek.length === 0 && ' אין אירועים מחר — תקבלי טיפ קידום עסקי.'}</div>
          </div>
        </div>
      </Card>
    </div>
  )
}
