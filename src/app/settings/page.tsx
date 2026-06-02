'use client'
import { useEffect, useState } from 'react'
import { Save, Building, Phone, Mail, Receipt, MessageCircle } from 'lucide-react'
import { Card, Button, Input, Select } from '@/components/ui'

interface Settings {
  business_name: string
  owner_name: string
  phone: string
  whatsapp_phone: string
  email: string
  business_type: string
  business_number: string
  address: string
  receipt_notes: string
}

const DEFAULT: Settings = {
  business_name: '', owner_name: '', phone: '',
  whatsapp_phone: '', email: '', business_type: 'exempt',
  business_number: '', address: '', receipt_notes: '',
}

export default function SettingsPage() {
  const [form, setForm] = useState<Settings>(DEFAULT)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetch('/api/settings').then(r => r.json()).then(d => {
      setForm({ ...DEFAULT, ...d })
      setLoading(false)
    })
  }, [])

  async function save() {
    setSaving(true)
    await fetch('/api/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const f = (k: keyof Settings, v: string) => setForm(p => ({ ...p, [k]: v }))

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div className="space-y-5 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">הגדרות עסק</h1>
          <p className="text-gray-500 text-sm">פרטי העסק שמופיעים בקבלות ובהודעות</p>
        </div>
        <Button variant="primary" onClick={save} disabled={saving}>
          <Save size={14} />
          {saving ? 'שומר...' : saved ? 'נשמר ✓' : 'שמור שינויים'}
        </Button>
      </div>

      {/* פרטי עסק */}
      <Card>
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
          <Building size={15} className="text-teal-600" />
          <span className="font-medium text-sm text-gray-900">פרטי העסק</span>
        </div>
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="שם העסק" value={form.business_name} onChange={e => f('business_name', e.target.value)} placeholder="איפור הדר" />
            <Input label="שם המאפרת" value={form.owner_name} onChange={e => f('owner_name', e.target.value)} placeholder="הדר פויכטונגר" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select label="סוג עוסק" value={form.business_type} onChange={e => f('business_type', e.target.value)}>
              <option value="exempt">עוסק פטור</option>
              <option value="licensed">עוסק מורשה</option>
              <option value="company">חברה בע"מ</option>
            </Select>
            <Input label="מספר עוסק / ח.פ" value={form.business_number} onChange={e => f('business_number', e.target.value)} placeholder="212213763" />
          </div>
          <Input label="כתובת" value={form.address} onChange={e => f('address', e.target.value)} placeholder="רחוב, עיר" />
        </div>
      </Card>

      {/* פרטי קשר */}
      <Card>
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
          <Phone size={15} className="text-teal-600" />
          <span className="font-medium text-sm text-gray-900">פרטי קשר</span>
        </div>
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="טלפון" value={form.phone} onChange={e => f('phone', e.target.value)} placeholder="050-0000000" type="tel" />
            <Input label="אימייל" value={form.email} onChange={e => f('email', e.target.value)} placeholder="email@example.com" type="email" />
          </div>
        </div>
      </Card>

      {/* וואטסאפ */}
      <Card>
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
          <MessageCircle size={15} className="text-teal-600" />
          <span className="font-medium text-sm text-gray-900">מספר וואטסאפ לסיכום יומי</span>
        </div>
        <div className="p-5 space-y-4">
          <Input
            label="מספר וואטסאפ (עם קידומת 972)"
            value={form.whatsapp_phone}
            onChange={e => f('whatsapp_phone', e.target.value)}
            placeholder="972501234567"
          />
          <div className="bg-teal-50 border border-teal-200 rounded-lg p-3 text-xs text-teal-700">
            זה המספר שיקבל את הסיכום היומי ב-18:00 כל יום. ניתן לשנות בכל עת.
        <button
          onClick={async () => {
            const res = await fetch('/api/whatsapp/test', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ phone: form.whatsapp_phone }) })
            const data = await res.json()
            alert(data.success ? '✅ הודעת בדיקה נשלחה!' : '❌ שגיאה: ' + data.error)
          }}
          className="mx-5 mb-4 px-4 py-2 bg-teal-600 text-white rounded-lg text-sm hover:bg-teal-700"
        >
          📱 שלח הודעת בדיקה
        </button>
          </div>
        </div>
      </Card>

      {/* קבלות */}
      <Card>
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
          <Receipt size={15} className="text-teal-600" />
          <span className="font-medium text-sm text-gray-900">הגדרות קבלה</span>
        </div>
        <div className="p-5">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">הערות בתחתית הקבלה</label>
            <textarea
              value={form.receipt_notes}
              onChange={e => f('receipt_notes', e.target.value)}
              placeholder="תודה על הבחירה! מחכה לראותך באירוע ✨"
              rows={3}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
            />
          </div>
        </div>
      </Card>

      <div className="flex justify-end">
        <Button variant="primary" onClick={save} disabled={saving} className="px-8">
          <Save size={14} />
          {saving ? 'שומר...' : saved ? 'נשמר ✓' : 'שמור שינויים'}
        </Button>
      </div>
    </div>
  )
}
