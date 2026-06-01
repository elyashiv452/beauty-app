import { EventType, ClientType, LeadStatus } from '@/types'

export const EVENT_LABELS: Record<EventType, string> = {
  wedding: 'חתונה',
  bat_mitzva: 'בת/בר מצווה',
  event: 'אירוע',
  other: 'אחר',
}

export const CLIENT_TYPE_LABELS: Record<ClientType, string> = {
  bride: 'כלה',
  companion: 'מלווה',
}

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  new: 'ליד חדש',
  contacted: 'יצירת קשר',
  active: 'שיחה פעילה',
  quote: 'הצעת מחיר',
  closed: 'סגור',
  lost: 'אבוד',
}

export const HEARD_FROM_OPTIONS = [
  'המלצת חברה',
  'אינסטגרם',
  'פייסבוק',
  'גוגל',
  'SMS',
  'אחר',
]

export function formatDate(dateStr?: string): string {
  if (!dateStr) return '—'
  const [y, m, d] = dateStr.split('-')
  return `${d}.${m}.${y}`
}

export function formatCurrency(amount: number): string {
  return `₪${amount.toLocaleString('he-IL')}`
}

export function daysSince(isoDate: string): number {
  return Math.floor((Date.now() - new Date(isoDate).getTime()) / 86400000)
}

export function hoursSince(isoDate: string): number {
  return Math.floor((Date.now() - new Date(isoDate).getTime()) / 3600000)
}
