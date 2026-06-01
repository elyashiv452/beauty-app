'use client'
import { useEffect, useState } from 'react'
import { Search, Phone, Calendar, MapPin, CreditCard, Plus } from 'lucide-react'
import { Client } from '@/types'
import { Badge, Card, Modal, Button, Input, Select, Textarea } from '@/components/ui'
import { EVENT_LABELS, CLIENT_TYPE_LABELS, HEARD_FROM_OPTIONS, formatDate, formatCurrency } from '@/lib/utils'

const PAYMENT_LABELS = { none: 'טרם שולם', deposit: 'מקדמה', full: 'שולם מלא' }
const PAYMENT_COLORS = { none: 'red', deposit: 'amber', full: 'green' } as const

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Client | null>(null)
  const [showPayment, setShowPayment] = useState(false)
  const [payAmount, setPayAmount] = useState('')
  const [payMethod, setPayMethod] = useState<'bit' | 'paybox' | 'transfer' | 'cash'>('bit')
  const [payType, setPayType] = useState<'deposit' | 'balance' | 'full'>('deposit')

  useEffect(() => { fetch('/api/clients').then(r => r.json()).then(setClients) }, [])

  const filtered = clients.filter(c =>
    c.name.includes(search) || c.phone.includes(search)
  )

  async function recordPayment() {
    if (!selected || !payAmount) return
    await fetch('/api/payments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clientId: selected.id, clientName: selected.name,
        amount: parseInt(payAmount), type: payType,
        method: payMethod, date: new Date().toISOString(),
      }),
    })
    const updated = await fetch('/api/clients').then(r => r.json())
    setClients(updated)
    const freshClient = updated.find((c: Client) => c.id === selected.id)
    setSelected(freshClient || null)
    setShowPayment(false)
    setPayAmount('')
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">לקוחות</h1>
          <p className="text-gray-500 text-sm">{clients.length} לקוחות</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="חיפוש לפי שם או טלפון..."
          className="w-full pr-9 pl-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
      </div>

      {/* List */}
      <div className="space-y-2">
        {filtered.map(client => (
          <Card key={client.id} className="cursor-pointer hover:border-teal-200 transition-colors" >
            <div className="px-5 py-4 flex items-center gap-4" onClick={() => setSelected(client)}>
              <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-semibold text-sm flex-shrink-0">
                {client.name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-medium text-sm text-gray-900">{client.name}</span>
                  <Badge variant={client.clientType === 'bride' ? 'pink' : 'purple'}>
                    {CLIENT_TYPE_LABELS[client.clientType]}
                  </Badge>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span className="flex items-center gap-1"><Phone size={11} />{client.phone}</span>
                  {client.eventDate && <span className="flex items-center gap-1"><Calendar size={11} />{formatDate(client.eventDate)} · {EVENT_LABELS[client.eventType]}</span>}
                  {client.location && <span className="flex items-center gap-1"><MapPin size={11} />{client.location}</span>}
                </div>
              </div>
              <div className="text-left">
                <div className="text-sm font-medium text-gray-900">{formatCurrency(client.totalAmount)}</div>
                <Badge variant={PAYMENT_COLORS[client.paymentStatus]}>{PAYMENT_LABELS[client.paymentStatus]}</Badge>
              </div>
            </div>
          </Card>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-16 text-gray-400 text-sm">לא נמצאו לקוחות</div>
        )}
      </div>

      {/* Client detail modal */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title={selected?.name || ''} wide>
        {selected && (
          <div className="space-y-5">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant={selected.clientType === 'bride' ? 'pink' : 'purple'}>{CLIENT_TYPE_LABELS[selected.clientType]}</Badge>
              <Badge variant="gray">{EVENT_LABELS[selected.eventType]}</Badge>
              <Badge variant={PAYMENT_COLORS[selected.paymentStatus]}>{PAYMENT_LABELS[selected.paymentStatus]}</Badge>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><div className="text-xs text-gray-400 mb-0.5">טלפון</div><a href={`tel:${selected.phone}`} className="text-teal-600">{selected.phone}</a></div>
              <div><div className="text-xs text-gray-400 mb-0.5">תאריך אירוע</div><div>{formatDate(selected.eventDate)}</div></div>
              <div><div className="text-xs text-gray-400 mb-0.5">מיקום</div><div>{selected.location || '—'}</div></div>
              <div><div className="text-xs text-gray-400 mb-0.5">מלוות</div><div>{selected.companions}</div></div>
              {selected.heardFrom && <div><div className="text-xs text-gray-400 mb-0.5">שמעה עלי</div><div>{selected.heardFrom}</div></div>}
            </div>

            {/* Payment summary */}
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <CreditCard size={14} className="text-gray-500" />
                <span className="text-sm font-medium text-gray-700">תשלומים</span>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div><div className="text-xs text-gray-400 mb-0.5">סה"כ</div><div className="font-semibold text-gray-900">{formatCurrency(selected.totalAmount)}</div></div>
                <div><div className="text-xs text-gray-400 mb-0.5">שולם</div><div className="font-semibold text-green-600">{formatCurrency(selected.paidAmount)}</div></div>
                <div><div className="text-xs text-gray-400 mb-0.5">יתרה</div><div className="font-semibold text-amber-600">{formatCurrency(selected.totalAmount - selected.paidAmount)}</div></div>
              </div>
            </div>

            {selected.notes && <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600">{selected.notes}</div>}

            <div className="flex gap-2">
              <Button variant="primary" onClick={() => setShowPayment(true)} className="flex-1">
                <CreditCard size={14} /> רשום תשלום
              </Button>
              <a href={`https://wa.me/972${selected.phone.replace(/\D/g, '').replace(/^0/, '')}`} target="_blank" rel="noreferrer">
                <Button variant="secondary">WhatsApp</Button>
              </a>
            </div>
          </div>
        )}
      </Modal>

      {/* Payment modal */}
      <Modal open={showPayment} onClose={() => setShowPayment(false)} title="רישום תשלום">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input label="סכום (₪)" value={payAmount} onChange={e => setPayAmount(e.target.value)} type="number" placeholder="0" />
            <Select label="סוג תשלום" value={payType} onChange={e => setPayType(e.target.value as 'deposit' | 'balance' | 'full')}>
              <option value="deposit">מקדמה</option>
              <option value="balance">יתרה</option>
              <option value="full">מלא</option>
            </Select>
          </div>
          <Select label="אמצעי תשלום" value={payMethod} onChange={e => setPayMethod(e.target.value as 'bit' | 'paybox' | 'transfer' | 'cash')}>
            <option value="bit">ביט</option>
            <option value="paybox">פייבוקס</option>
            <option value="transfer">העברה בנקאית</option>
            <option value="cash">מזומן</option>
          </Select>
          <div className="flex gap-2 pt-2">
            <Button variant="primary" onClick={recordPayment} disabled={!payAmount} className="flex-1">
              אשר תשלום + קבלה
            </Button>
            <Button variant="secondary" onClick={() => setShowPayment(false)}>ביטול</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
