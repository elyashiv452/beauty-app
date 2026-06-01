import { Lead, Client, Appointment, Payment } from '@/types'

function generateId() {
  return Math.random().toString(36).substring(2, 10)
}

const now = new Date()
const today = now.toISOString().split('T')[0]
const tomorrow = new Date(now.getTime() + 86400000).toISOString().split('T')[0]
const nextWeek = new Date(now.getTime() + 7 * 86400000).toISOString().split('T')[0]

// ── Seed Data ──────────────────────────────────────────────────

const seedLeads: Lead[] = [
  {
    id: 'l1', name: 'נועה כהן', phone: '050-1234567', status: 'new',
    clientType: 'bride', eventType: 'wedding', eventDate: '2025-08-15',
    location: 'תל אביב', companions: 0, heardFrom: 'המלצת חברה',
    notes: 'שאלה על מחירים', source: 'whatsapp',
    createdAt: new Date(now.getTime() - 5 * 60000).toISOString(),
    updatedAt: new Date(now.getTime() - 5 * 60000).toISOString(),
  },
  {
    id: 'l2', name: 'שירה לוי', phone: '052-9876543', status: 'new',
    clientType: 'companion', eventType: 'bat_mitzva', eventDate: '2025-09-22',
    location: 'ירושלים', companions: 3, heardFrom: 'אינסטגרם',
    notes: 'רוצה עיפרון וצלליות', source: 'whatsapp',
    createdAt: new Date(now.getTime() - 2 * 3600000).toISOString(),
    updatedAt: new Date(now.getTime() - 2 * 3600000).toISOString(),
  },
  {
    id: 'l3', name: 'רחל משה', phone: '054-1111222', status: 'contacted',
    clientType: 'bride', eventType: 'wedding', eventDate: '2025-07-10',
    location: 'נתניה', companions: 0, heardFrom: 'גוגל',
    source: 'whatsapp', noReplyWarning: true,
    createdAt: new Date(now.getTime() - 50 * 3600000).toISOString(),
    updatedAt: new Date(now.getTime() - 50 * 3600000).toISOString(),
  },
  {
    id: 'l4', name: 'טל ברקוביץ', phone: '053-5554433', status: 'contacted',
    clientType: 'companion', eventType: 'wedding', eventDate: '2025-08-05',
    location: 'רמת גן', companions: 5, heardFrom: 'פייסבוק',
    source: 'whatsapp',
    createdAt: new Date(now.getTime() - 20 * 3600000).toISOString(),
    updatedAt: new Date(now.getTime() - 20 * 3600000).toISOString(),
  },
  {
    id: 'l5', name: 'יעל כץ', phone: '050-9988776', status: 'quote',
    clientType: 'bride', eventType: 'wedding', eventDate: '2025-06-30',
    location: 'הרצליה', companions: 4, heardFrom: 'המלצה',
    source: 'whatsapp',
    createdAt: new Date(now.getTime() - 3 * 86400000).toISOString(),
    updatedAt: new Date(now.getTime() - 3 * 86400000).toISOString(),
  },
  {
    id: 'l6', name: 'הילה רוזן', phone: '052-3332211', status: 'closed',
    clientType: 'bride', eventType: 'wedding', eventDate: '2025-06-12',
    location: 'תל אביב', companions: 2, heardFrom: 'המלצה',
    source: 'whatsapp',
    createdAt: new Date(now.getTime() - 10 * 86400000).toISOString(),
    updatedAt: new Date(now.getTime() - 2 * 86400000).toISOString(),
  },
]

const seedClients: Client[] = [
  {
    id: 'c1', name: 'הילה רוזן', phone: '052-3332211',
    clientType: 'bride', eventType: 'wedding', eventDate: '2025-06-12',
    location: 'תל אביב', companions: 2, heardFrom: 'המלצה',
    totalAmount: 1400, paidAmount: 420, paymentStatus: 'deposit',
    createdAt: new Date(now.getTime() - 2 * 86400000).toISOString(),
    leadId: 'l6',
  },
  {
    id: 'c2', name: 'כרמית עוז', phone: '054-7776655',
    clientType: 'bride', eventType: 'wedding', eventDate: '2025-06-25',
    location: 'רמת גן', companions: 3,
    totalAmount: 2200, paidAmount: 2200, paymentStatus: 'full',
    createdAt: new Date(now.getTime() - 5 * 86400000).toISOString(),
  },
  {
    id: 'c3', name: 'מור בן-דוד', phone: '050-4445566',
    clientType: 'companion', eventType: 'event', eventDate: '2025-07-08',
    location: 'חיפה', companions: 2,
    totalAmount: 600, paidAmount: 180, paymentStatus: 'deposit',
    createdAt: new Date(now.getTime() - 3 * 86400000).toISOString(),
  },
]

const seedAppointments: Appointment[] = [
  {
    id: 'a1', clientId: 'c1', clientName: 'הילה רוזן', phone: '052-3332211',
    date: tomorrow, time: '07:00', eventType: 'wedding', clientType: 'bride',
    location: 'רח׳ דיזנגוף 5, תל אביב', companions: 2,
    notes: 'הגעה לבית הכלה', totalAmount: 1400, paidAmount: 420,
    paymentStatus: 'deposit', confirmed: true,
  },
  {
    id: 'a2', clientId: 'c2', clientName: 'כרמית עוז', phone: '054-7776655',
    date: tomorrow, time: '14:00', eventType: 'wedding', clientType: 'bride',
    location: 'מלון דן, רמת גן', companions: 3,
    totalAmount: 2200, paidAmount: 2200,
    paymentStatus: 'full', confirmed: true,
  },
  {
    id: 'a3', clientId: 'c3', clientName: 'מור בן-דוד', phone: '050-4445566',
    date: nextWeek, time: '10:00', eventType: 'event', clientType: 'companion',
    location: 'חיפה', companions: 2,
    totalAmount: 600, paidAmount: 180,
    paymentStatus: 'deposit', confirmed: false,
  },
]

const seedPayments: Payment[] = [
  {
    id: 'p1', clientId: 'c1', clientName: 'הילה רוזן',
    amount: 420, type: 'deposit', method: 'bit',
    date: new Date(now.getTime() - 2 * 86400000).toISOString(),
    receiptNumber: 'R-1001',
  },
  {
    id: 'p2', clientId: 'c2', clientName: 'כרמית עוז',
    amount: 2200, type: 'full', method: 'transfer',
    date: new Date(now.getTime() - 4 * 86400000).toISOString(),
    receiptNumber: 'R-1002',
  },
  {
    id: 'p3', clientId: 'c3', clientName: 'מור בן-דוד',
    amount: 180, type: 'deposit', method: 'bit',
    date: new Date(now.getTime() - 1 * 86400000).toISOString(),
    receiptNumber: 'R-1003',
  },
]

// ── Global Store ───────────────────────────────────────────────

declare global {
  // eslint-disable-next-line no-var
  var __store: {
    leads: Lead[]
    clients: Client[]
    appointments: Appointment[]
    payments: Payment[]
    receiptCounter: number
  } | undefined
}

if (!global.__store) {
  global.__store = {
    leads: seedLeads,
    clients: seedClients,
    appointments: seedAppointments,
    payments: seedPayments,
    receiptCounter: 1004,
  }
}

export const store = global.__store

export function createLead(data: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>): Lead {
  const lead: Lead = {
    ...data,
    id: generateId(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  store.leads.unshift(lead)
  return lead
}

export function updateLead(id: string, data: Partial<Lead>): Lead | null {
  const idx = store.leads.findIndex(l => l.id === id)
  if (idx === -1) return null
  store.leads[idx] = { ...store.leads[idx], ...data, updatedAt: new Date().toISOString() }
  return store.leads[idx]
}

export function deleteLead(id: string): boolean {
  const idx = store.leads.findIndex(l => l.id === id)
  if (idx === -1) return false
  store.leads.splice(idx, 1)
  return true
}

export function closeLeadAsClient(leadId: string): Client | null {
  const lead = store.leads.find(l => l.id === leadId)
  if (!lead) return null
  updateLead(leadId, { status: 'closed' })
  const client: Client = {
    id: generateId(),
    name: lead.name, phone: lead.phone,
    clientType: lead.clientType, eventType: lead.eventType,
    eventDate: lead.eventDate, location: lead.location,
    companions: lead.companions, heardFrom: lead.heardFrom,
    notes: lead.notes, totalAmount: 0, paidAmount: 0,
    paymentStatus: 'none',
    createdAt: new Date().toISOString(),
    leadId,
  }
  store.clients.unshift(client)
  return client
}

export function createClient(data: Omit<Client, 'id' | 'createdAt'>): Client {
  const client: Client = { ...data, id: generateId(), createdAt: new Date().toISOString() }
  store.clients.unshift(client)
  return client
}

export function updateClient(id: string, data: Partial<Client>): Client | null {
  const idx = store.clients.findIndex(c => c.id === id)
  if (idx === -1) return null
  store.clients[idx] = { ...store.clients[idx], ...data }
  return store.clients[idx]
}

export function createAppointment(data: Omit<Appointment, 'id'>): Appointment {
  const apt: Appointment = { ...data, id: generateId() }
  store.appointments.push(apt)
  store.appointments.sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))
  return apt
}

export function updateAppointment(id: string, data: Partial<Appointment>): Appointment | null {
  const idx = store.appointments.findIndex(a => a.id === id)
  if (idx === -1) return null
  store.appointments[idx] = { ...store.appointments[idx], ...data }
  return store.appointments[idx]
}

export function recordPayment(data: Omit<Payment, 'id' | 'receiptNumber'>): Payment {
  const receiptNumber = `R-${store.receiptCounter++}`
  const payment: Payment = { ...data, id: generateId(), receiptNumber }
  store.payments.unshift(payment)
  // update client
  const client = store.clients.find(c => c.id === data.clientId)
  if (client) {
    client.paidAmount += data.amount
    if (client.paidAmount >= client.totalAmount && client.totalAmount > 0) {
      client.paymentStatus = 'full'
    } else if (client.paidAmount > 0) {
      client.paymentStatus = 'deposit'
    }
  }
  return payment
}

export function getDashboardStats() {
  const todayStr = new Date().toISOString().split('T')[0]
  const todayApts = store.appointments.filter(a => a.date === todayStr)
  const nextWeekDate = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]
  const upcomingWeek = store.appointments
    .filter(a => a.date >= todayStr && a.date <= nextWeekDate)
    .slice(0, 5)
  const thisMonth = new Date().toISOString().substring(0, 7)
  const monthRevenue = store.payments
    .filter(p => p.date.startsWith(thisMonth))
    .reduce((s, p) => s + p.amount, 0)

  return {
    todayAppointments: todayApts.length,
    todayRevenue: todayApts.reduce((s, a) => s + (a.totalAmount - a.paidAmount), 0),
    newLeads: store.leads.filter(l => l.status === 'new').length,
    pendingLeads: store.leads.filter(l => l.noReplyWarning).length,
    monthRevenue,
    upcomingWeek,
  }
}
