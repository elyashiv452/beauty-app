'use client'
import { useEffect, useState } from 'react'
import { Plus, Phone, MapPin, Calendar, AlertCircle, MessageCircle, ChevronLeft, X, Sparkles } from 'lucide-react'
import { Lead, LeadStatus } from '@/types'
import { Badge, StatusBadge, Modal, Button, Input, Select, Textarea, EmptyState } from '@/components/ui'
import { LEAD_STATUS_LABELS, EVENT_LABELS, CLIENT_TYPE_LABELS, HEARD_FROM_OPTIONS, formatDate, hoursSince } from '@/lib/utils'

const COLUMNS: LeadStatus[] = ['new', 'contacted', 'active', 'quote', 'closed']
const COLUMN_COLORS: Record<LeadStatus, string> = {
  new: 'border-t-amber-400', contacted: 'border-t-purple-400',
  active: 'border-t-teal-400', quote: 'border-t-pink-400',
  closed: 'border-t-green-400', lost: 'border-t-gray-400',
}

const DEFAULT_FORM = {
  name: '', phone: '', status: 'new' as LeadStatus,
  clientType: 'bride' as const, eventType: 'wedding' as const,
  eventDate: '', location: '', companions: 0,
  heardFrom: '', notes: '', source: 'whatsapp',
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [selected, setSelected] = useState<Lead | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState(DEFAULT_FORM)
  const [dragging, setDragging] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { refresh() }, [])

  async function refresh() {
    const data = await fetch('/api/leads').then(r => r.json())
    setLeads(data)
    setLoading(false)
  }

  async function saveLead() {
    await fetch('/api/leads', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    setShowAdd(false)
    setForm(DEFAULT_FORM)
    refresh()
  }

  async function updateStatus(id: string, status: LeadStatus) {
    await fetch('/api/leads', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status }) })
    setLeads(prev => prev.map(l => l.id === id ? { ...l, status } : l))
    if (selected?.id === id) setSelected(prev => prev ? { ...prev, status } : prev)
  }

  async function closeLead(leadId: string) {
    await fetch('/api/leads', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'close', leadId }) })
    setSelected(null)
    refresh()
  }

  async function deleteLead(id: string) {
    await fetch(`/api/leads?id=${id}`, { method: 'DELETE' })
    setSelected(null)
    refresh()
  }

  function onDragStart(id: string) { setDragging(id) }
  function onDrop(status: LeadStatus) {
    if (dragging) { updateStatus(dragging, status); setDragging(null) }
  }

  const byStatus = (s: LeadStatus) => leads.filter(l => l.status === s)

  const f = (k: string, v: string | number) => setForm(prev => ({ ...prev, [k]: v }))

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">ניהול לידים</h1>
          <p className="text-gray-500 text-sm">{leads.filter(l => l.status !== 'closed' && l.status !== 'lost').length} לידים פעילים</p>
        </div>
        <Button variant="primary" onClick={() => setShowAdd(true)}>
          <Plus size={16} /> ליד חדש
        </Button>
      </div>

      {/* Kanban */}
      {loading ? (
        <div className="flex items-center justify-center h-64"><div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-4">
          {COLUMNS.map(status => (
            <div
              key={status}
              className="flex-shrink-0 w-56"
              onDragOver={e => e.preventDefault()}
              onDrop={() => onDrop(status)}
            >
              <div className={`bg-white rounded-xl border border-gray-100 border-t-2 ${COLUMN_COLORS[status]} shadow-sm`}>
                <div className="px-3 py-2.5 border-b border-gray-50 flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-700">{LEAD_STATUS_LABELS[status]}</span>
                  <span className="text-xs bg-gray-100 text-gray-500 rounded-full px-2 py-0.5">{byStatus(status).length}</span>
                </div>
                <div className="p-2 space-y-2 min-h-[80px]">
                  {byStatus(status).map(lead => (
                    <LeadCard key={lead.id} lead={lead} onClick={() => setSelected(lead)} onDragStart={() => onDragStart(lead.id)} />
                  ))}
                  {byStatus(status).length === 0 && (
                    <div className="py-6 text-center text-xs text-gray-300">גרור לכאן</div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lead Detail Modal */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title={selected?.name || ''}>
        {selected && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 flex-wrap">
              <StatusBadge status={selected.status} />
              <Badge variant={selected.clientType === 'bride' ? 'pink' : 'purple'}>
                {CLIENT_TYPE_LABELS[selected.clientType]}
              </Badge>
              <Badge variant="gray">{EVENT_LABELS[selected.eventType]}</Badge>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <Field label="טלפון" value={selected.phone} icon={<Phone size={13} />} />
              <Field label="תאריך אירוע" value={formatDate(selected.eventDate)} icon={<Calendar size={13} />} />
              <Field label="מיקום" value={selected.location || '—'} icon={<MapPin size={13} />} />
              <Field label="מלוות" value={selected.companions > 0 ? `${selected.companions} מלוות` : 'ללא מלוות'} />
              <Field label="שמעה עלי" value={selected.heardFrom || '—'} />
              <Field label="נכנס" value={`לפני ${hoursSince(selected.createdAt)} שעות`} />
            </div>
            {selected.notes && (
              <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600">{selected.notes}</div>
            )}
            <div className="border-t border-gray-100 pt-4">
              <div className="text-xs font-medium text-gray-500 mb-2">שנה סטטוס</div>
              <div className="flex flex-wrap gap-2">
                {COLUMNS.filter(s => s !== selected.status).map(s => (
                  <button key={s} onClick={() => updateStatus(selected.id, s)}
                    className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-600 transition-colors">
                    {LEAD_STATUS_LABELS[s]}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button variant="primary" onClick={() => closeLead(selected.id)} className="flex-1">
                <Sparkles size={14} /> סגור כלקוחה
              </Button>
              <a href={`https://wa.me/972${selected.phone.replace(/\D/g, '').replace(/^0/, '')}`} target="_blank" rel="noreferrer">
                <Button variant="secondary">
                  <MessageCircle size={14} /> WA
                </Button>
              </a>
              <Button variant="danger" onClick={() => deleteLead(selected.id)}>
                <X size={14} />
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Add Lead Modal */}
      <Modal open={showAdd} onClose={() => { setShowAdd(false); setForm(DEFAULT_FORM) }} title="ליד חדש">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input label="שם מלא *" value={form.name} onChange={e => f('name', e.target.value)} placeholder="שם הלקוחה" />
            <Input label="טלפון *" value={form.phone} onChange={e => f('phone', e.target.value)} placeholder="050-0000000" type="tel" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Select label="סוג לקוחה" value={form.clientType} onChange={e => f('clientType', e.target.value)}>
              <option value="bride">כלה</option>
              <option value="companion">מלווה</option>
            </Select>
            <Select label="סוג אירוע" value={form.eventType} onChange={e => f('eventType', e.target.value)}>
              <option value="wedding">חתונה</option>
              <option value="bat_mitzva">בת/בר מצווה</option>
              <option value="event">אירוע</option>
              <option value="other">אחר</option>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="תאריך אירוע" value={form.eventDate} onChange={e => f('eventDate', e.target.value)} type="date" />
            <Input label="מיקום התארגנות" value={form.location} onChange={e => f('location', e.target.value)} placeholder="עיר / כתובת" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="מספר מלוות" value={form.companions} onChange={e => f('companions', parseInt(e.target.value) || 0)} type="number" min="0" />
            <Select label="איך שמעה עלי" value={form.heardFrom} onChange={e => f('heardFrom', e.target.value)}>
              <option value="">בחרי...</option>
              {HEARD_FROM_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
            </Select>
          </div>
          <Textarea label="הערות" value={form.notes} onChange={e => f('notes', e.target.value)} placeholder="הערות נוספות..." rows={3} />
          <div className="flex gap-2 pt-2">
            <Button variant="primary" onClick={saveLead} disabled={!form.name || !form.phone} className="flex-1">
              <Plus size={14} /> הוסף ליד
            </Button>
            <Button variant="secondary" onClick={() => { setShowAdd(false); setForm(DEFAULT_FORM) }}>ביטול</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

function LeadCard({ lead, onClick, onDragStart }: { lead: Lead; onClick: () => void; onDragStart: () => void }) {
  const urgent = lead.noReplyWarning
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onClick={onClick}
      className={`bg-white rounded-lg border cursor-pointer hover:shadow-sm transition-all p-3 ${urgent ? 'border-red-200 bg-red-50/30' : 'border-gray-100 hover:border-teal-200'}`}
    >
      <div className="flex items-start justify-between gap-1 mb-1.5">
        <span className="font-medium text-sm text-gray-900 truncate">{lead.name}</span>
        <Badge variant={lead.clientType === 'bride' ? 'pink' : 'purple'} >
          {lead.clientType === 'bride' ? 'כלה' : 'מלווה'}
        </Badge>
      </div>
      {lead.eventDate && (
        <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
          <Calendar size={10} />
          <span>{formatDate(lead.eventDate)}</span>
          <span className="text-gray-300">·</span>
          <span>{EVENT_LABELS[lead.eventType]}</span>
        </div>
      )}
      {lead.location && (
        <div className="flex items-center gap-1 text-xs text-gray-400">
          <MapPin size={10} /> {lead.location}
        </div>
      )}
      {urgent && (
        <div className="flex items-center gap-1 text-xs text-red-500 mt-1.5">
          <AlertCircle size={11} /> ללא מענה {hoursSince(lead.updatedAt)}ש
        </div>
      )}
    </div>
  )
}

function Field({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs text-gray-400 mb-0.5">{label}</div>
      <div className="text-sm text-gray-900 flex items-center gap-1">
        {icon && <span className="text-gray-400">{icon}</span>}
        {value}
      </div>
    </div>
  )
}
