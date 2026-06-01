'use client'
import { useEffect, useState } from 'react'
import { Payment } from '@/types'
import { Card } from '@/components/ui'
import { formatCurrency } from '@/lib/utils'

export default function RevenuePage() {
  const [payments, setPayments] = useState<Payment[]>([])
  useEffect(() => { fetch('/api/payments').then(r => r.json()).then(setPayments) }, [])
  const thisMonth = new Date().toISOString().substring(0, 7)
  const monthTotal = payments.filter(p => p.date.startsWith(thisMonth)).reduce((s, p) => s + p.amount, 0)
  const allTotal = payments.reduce((s, p) => s + p.amount, 0)
  const byMonth = payments.reduce((acc, p) => {
    const m = p.date.substring(0, 7)
    acc[m] = (acc[m] || 0) + p.amount
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-gray-900">הכנסות וצפי</h1>
      <div className="grid grid-cols-2 gap-3">
        <Card className="p-4"><div className="text-xs text-gray-500 mb-1">החודש</div><div className="text-2xl font-semibold text-teal-600">{formatCurrency(monthTotal)}</div></Card>
        <Card className="p-4"><div className="text-xs text-gray-500 mb-1">סה"כ</div><div className="text-2xl font-semibold text-gray-900">{formatCurrency(allTotal)}</div></Card>
      </div>
      <Card>
        <div className="px-5 py-3 border-b border-gray-100 font-medium text-sm text-gray-900">פירוט לפי חודש</div>
        {Object.entries(byMonth).sort((a, b) => b[0].localeCompare(a[0])).map(([month, total]) => (
          <div key={month} className="px-5 py-3 flex justify-between border-b border-gray-50 last:border-0">
            <span className="text-sm text-gray-600">{new Date(month + '-01').toLocaleDateString('he-IL', { year: 'numeric', month: 'long' })}</span>
            <span className="font-medium text-gray-900">{formatCurrency(total)}</span>
          </div>
        ))}
        {Object.keys(byMonth).length === 0 && <div className="py-8 text-center text-gray-400 text-sm">אין נתונים עדיין</div>}
      </Card>
    </div>
  )
}
