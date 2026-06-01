'use client'
import { useEffect, useState } from 'react'
import { CreditCard, Receipt } from 'lucide-react'
import { Payment } from '@/types'
import { Card, Badge } from '@/components/ui'
import { formatCurrency } from '@/lib/utils'

const METHOD_LABELS: Record<string, string> = { bit: 'ביט', paybox: 'פייבוקס', transfer: 'העברה', cash: 'מזומן' }
const TYPE_LABELS: Record<string, string> = { deposit: 'מקדמה', balance: 'יתרה', full: 'מלא' }

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  useEffect(() => { fetch('/api/payments').then(r => r.json()).then(setPayments) }, [])
  const total = payments.reduce((s, p) => s + p.amount, 0)
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-gray-900">תשלומים וקבלות</h1>
      <div className="grid grid-cols-3 gap-3">
        <Card className="p-4"><div className="text-xs text-gray-500 mb-1">סה"כ תשלומים</div><div className="text-2xl font-semibold text-teal-600">{formatCurrency(total)}</div></Card>
        <Card className="p-4"><div className="text-xs text-gray-500 mb-1">מספר קבלות</div><div className="text-2xl font-semibold text-gray-900">{payments.length}</div></Card>
        <Card className="p-4"><div className="text-xs text-gray-500 mb-1">ממוצע לאירוע</div><div className="text-2xl font-semibold text-gray-900">{payments.length ? formatCurrency(Math.round(total / payments.length)) : '₪0'}</div></Card>
      </div>
      <Card>
        <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-2">
          <Receipt size={15} className="text-teal-600" />
          <span className="font-medium text-sm text-gray-900">היסטוריית תשלומים</span>
        </div>
        <div className="divide-y divide-gray-50">
          {payments.map(p => (
            <div key={p.id} className="px-5 py-3.5 flex items-center gap-4">
              <div className="w-9 h-9 rounded-lg bg-teal-50 flex items-center justify-center flex-shrink-0">
                <CreditCard size={16} className="text-teal-600" />
              </div>
              <div className="flex-1">
                <div className="font-medium text-sm text-gray-900">{p.clientName}</div>
                <div className="text-xs text-gray-500">{p.receiptNumber} · {METHOD_LABELS[p.method]} · {new Date(p.date).toLocaleDateString('he-IL')}</div>
              </div>
              <Badge variant={p.type === 'full' ? 'green' : 'amber'}>{TYPE_LABELS[p.type]}</Badge>
              <div className="font-semibold text-gray-900">{formatCurrency(p.amount)}</div>
            </div>
          ))}
          {payments.length === 0 && <div className="py-10 text-center text-gray-400 text-sm">אין תשלומים עדיין</div>}
        </div>
      </Card>
    </div>
  )
}
