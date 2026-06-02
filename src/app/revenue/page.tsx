'use client'
import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'
import { TrendingUp, CreditCard, Calendar, Award } from 'lucide-react'
import { Card, StatCard } from '@/components/ui'
import { formatCurrency } from '@/lib/utils'
import { Payment } from '@/types'

export default function RevenuePage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/payments').then(r => r.json()).then(d => { setPayments(d); setLoading(false) })
  }, [])

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" /></div>

  const thisMonth = new Date().toISOString().substring(0, 7)
  const lastMonth = new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().substring(0, 7)

  const monthlyData = payments.reduce((acc, p) => {
    const m = p.date.substring(0, 7)
    acc[m] = (acc[m] || 0) + p.amount
    return acc
  }, {} as Record<string, number>)

  const thisMonthTotal = monthlyData[thisMonth] || 0
  const lastMonthTotal = monthlyData[lastMonth] || 0
  const allTotal = payments.reduce((s, p) => s + p.amount, 0)
  const avgPayment = payments.length ? Math.round(allTotal / payments.length) : 0
  const growth = lastMonthTotal > 0 ? Math.round(((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100) : 0

  const chartData = Object.entries(monthlyData)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-6)
    .map(([month, total]) => ({
      name: new Date(month + '-01').toLocaleDateString('he-IL', { month: 'short' }),
      הכנסות: total,
    }))

  const methodData = ['bit', 'paybox', 'transfer', 'cash'].map(method => ({
    name: method === 'bit' ? 'ביט' : method === 'paybox' ? 'פייבוקס' : method === 'transfer' ? 'העברה' : 'מזומן',
    סכום: payments.filter(p => p.method === method).reduce((s, p) => s + p.amount, 0),
  })).filter(d => d.סכום > 0)

  const forecastData = [...chartData]
  if (chartData.length >= 2) {
    const last = chartData[chartData.length - 1].הכנסות
    const prev = chartData[chartData.length - 2].הכנסות
    const trend = last - prev
    forecastData.push({
      name: 'צפי',
      הכנסות: Math.max(0, last + trend),
    })
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">הכנסות וצפי</h1>
        <p className="text-gray-500 text-sm">סיכום פיננסי מלא</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="החודש" value={formatCurrency(thisMonthTotal)} color="teal"
          sub={growth !== 0 ? `${growth > 0 ? '+' : ''}${growth}% מחודש קודם` : undefined} />
        <StatCard label="חודש קודם" value={formatCurrency(lastMonthTotal)} />
        <StatCard label="סה״כ" value={formatCurrency(allTotal)} color="teal" />
        <StatCard label="ממוצע לתשלום" value={formatCurrency(avgPayment)} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card>
          <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
            <TrendingUp size={15} className="text-teal-600" />
            <span className="font-medium text-sm text-gray-900">הכנסות חודשיות + צפי</span>
          </div>
          <div className="p-4">
            {chartData.length === 0 ? (
              <div className="h-40 flex items-center justify-center text-gray-400 text-sm">אין נתונים עדיין</div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={forecastData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `₪${(v/1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v) => formatCurrency(v as number)} />
                  <Line type="monotone" dataKey="הכנסות" stroke="#0F6E56" strokeWidth={2} dot={{ fill: '#0F6E56' }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        <Card>
          <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
            <CreditCard size={15} className="text-teal-600" />
            <span className="font-medium text-sm text-gray-900">אמצעי תשלום</span>
          </div>
          <div className="p-4">
            {methodData.length === 0 ? (
              <div className="h-40 flex items-center justify-center text-gray-400 text-sm">אין נתונים עדיין</div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={methodData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `₪${(v/1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v) => formatCurrency(v as number)} />
                  <Bar dataKey="סכום" fill="#0F6E56" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>
      </div>

      <Card>
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
          <Calendar size={15} className="text-teal-600" />
          <span className="font-medium text-sm text-gray-900">פירוט חודשי</span>
        </div>
        {Object.entries(monthlyData).sort((a, b) => b[0].localeCompare(a[0])).map(([month, total]) => (
          <div key={month} className="px-5 py-3 flex justify-between items-center border-b border-gray-50 last:border-0">
            <div>
              <div className="text-sm font-medium text-gray-900">
                {new Date(month + '-01').toLocaleDateString('he-IL', { year: 'numeric', month: 'long' })}
              </div>
              <div className="text-xs text-gray-400">
                {payments.filter(p => p.date.startsWith(month)).length} תשלומים
              </div>
            </div>
            <div className="font-semibold text-teal-600">{formatCurrency(total)}</div>
          </div>
        ))}
        {Object.keys(monthlyData).length === 0 && (
          <div className="py-10 text-center text-gray-400 text-sm">אין נתונים עדיין</div>
        )}
      </Card>
    </div>
  )
}
