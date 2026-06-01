import { supabase } from './supabase'
import { Lead, Client, Appointment, Payment } from '@/types'

function generateId() {
  return Math.random().toString(36).substring(2, 10)
}

// ── LEADS ──────────────────────────────────────────────────────
export async function getLeads(): Promise<Lead[]> {
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data || []).map(dbToLead)
}

export async function createLead(data: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>): Promise<Lead> {
  const row = { ...leadToDb(data), id: generateId(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
  const { data: result, error } = await supabase.from('leads').insert(row).select().single()
  if (error) throw error
  return dbToLead(result)
}

export async function updateLead(id: string, data: Partial<Lead>): Promise<Lead> {
  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (data.name !== undefined) updates.name = data.name
  if (data.phone !== undefined) updates.phone = data.phone
  if (data.status !== undefined) updates.status = data.status
  if (data.clientType !== undefined) updates.client_type = data.clientType
  if (data.eventType !== undefined) updates.event_type = data.eventType
  if (data.eventDate !== undefined) updates.event_date = data.eventDate
  if (data.location !== undefined) updates.location = data.location
  if (data.companions !== undefined) updates.companions = data.companions
  if (data.heardFrom !== undefined) updates.heard_from = data.heardFrom
  if (data.notes !== undefined) updates.notes = data.notes
  if (data.noReplyWarning !== undefined) updates.no_reply_warning = data.noReplyWarning
  const { data: result, error } = await supabase.from('leads').update(updates).eq('id', id).select().single()
  if (error) throw error
  return dbToLead(result)
}

export async function deleteLead(id: string): Promise<void> {
  const { error } = await supabase.from('leads').delete().eq('id', id)
  if (error) throw error
}

export async function closeLeadAsClient(leadId: string): Promise<Client> {
  const { data: lead, error: leadError } = await supabase.from('leads').select('*').eq('id', leadId).single()
  if (leadError) throw leadError
  await supabase.from('leads').update({ status: 'closed', updated_at: new Date().toISOString() }).eq('id', leadId)
  const clientRow = {
    id: generateId(),
    name: lead.name, phone: lead.phone,
    client_type: lead.client_type, event_type: lead.event_type,
    event_date: lead.event_date, location: lead.location,
    companions: lead.companions, heard_from: lead.heard_from,
    notes: lead.notes, total_amount: 0, paid_amount: 0,
    payment_status: 'none', lead_id: leadId,
    created_at: new Date().toISOString(),
  }
  const { data: client, error } = await supabase.from('clients').insert(clientRow).select().single()
  if (error) throw error
  return dbToClient(client)
}

// ── CLIENTS ────────────────────────────────────────────────────
export async function getClients(): Promise<Client[]> {
  const { data, error } = await supabase.from('clients').select('*').order('created_at', { ascending: false })
  if (error) throw error
  return (data || []).map(dbToClient)
}

export async function updateClient(id: string, data: Partial<Client>): Promise<Client> {
  const updates: Record<string, unknown> = {}
  if (data.totalAmount !== undefined) updates.total_amount = data.totalAmount
  if (data.paidAmount !== undefined) updates.paid_amount = data.paidAmount
  if (data.paymentStatus !== undefined) updates.payment_status = data.paymentStatus
  if (data.notes !== undefined) updates.notes = data.notes
  const { data: result, error } = await supabase.from('clients').update(updates).eq('id', id).select().single()
  if (error) throw error
  return dbToClient(result)
}

// ── APPOINTMENTS ───────────────────────────────────────────────
export async function getAppointments(): Promise<Appointment[]> {
  const { data, error } = await supabase.from('appointments').select('*').order('date').order('time')
  if (error) throw error
  return (data || []).map(dbToAppointment)
}

export async function createAppointment(data: Omit<Appointment, 'id'>): Promise<Appointment> {
  const row = { ...aptToDb(data), id: generateId(), created_at: new Date().toISOString() }
  const { data: result, error } = await supabase.from('appointments').insert(row).select().single()
  if (error) throw error
  return dbToAppointment(result)
}

export async function updateAppointment(id: string, data: Partial<Appointment>): Promise<Appointment> {
  const updates: Record<string, unknown> = {}
  if (data.confirmed !== undefined) updates.confirmed = data.confirmed
  if (data.notes !== undefined) updates.notes = data.notes
  if (data.totalAmount !== undefined) updates.total_amount = data.totalAmount
  if (data.paidAmount !== undefined) updates.paid_amount = data.paidAmount
  const { data: result, error } = await supabase.from('appointments').update(updates).eq('id', id).select().single()
  if (error) throw error
  return dbToAppointment(result)
}

// ── PAYMENTS ───────────────────────────────────────────────────
export async function getPayments(): Promise<Payment[]> {
  const { data, error } = await supabase.from('payments').select('*').order('date', { ascending: false })
  if (error) throw error
  return (data || []).map(dbToPayment)
}

export async function recordPayment(data: Omit<Payment, 'id' | 'receiptNumber'>): Promise<Payment> {
  const { count } = await supabase.from('payments').select('*', { count: 'exact', head: true })
  const receiptNumber = `R-${1001 + (count || 0)}`
  const row = {
    id: generateId(),
    client_id: data.clientId, client_name: data.clientName,
    amount: data.amount, type: data.type, method: data.method,
    date: data.date, receipt_number: receiptNumber, notes: data.notes,
  }
  const { data: result, error } = await supabase.from('payments').insert(row).select().single()
  if (error) throw error
  // update client paid amount
  const { data: client } = await supabase.from('clients').select('paid_amount, total_amount').eq('id', data.clientId).single()
  if (client) {
    const newPaid = (client.paid_amount || 0) + data.amount
    const status = newPaid >= client.total_amount && client.total_amount > 0 ? 'full' : 'deposit'
    await supabase.from('clients').update({ paid_amount: newPaid, payment_status: status }).eq('id', data.clientId)
  }
  return dbToPayment(result)
}

// ── STATS ──────────────────────────────────────────────────────
export async function getDashboardStats() {
  const today = new Date().toISOString().split('T')[0]
  const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]
  const thisMonth = new Date().toISOString().substring(0, 7)

  const [leadsRes, aptsRes, weekAptsRes, paymentsRes] = await Promise.all([
    supabase.from('leads').select('status, no_reply_warning'),
    supabase.from('appointments').select('*').eq('date', today),
    supabase.from('appointments').select('*').gte('date', today).lte('date', nextWeek).order('date').order('time').limit(5),
    supabase.from('payments').select('amount, date').like('date', `${thisMonth}%`),
  ])

  const leads = leadsRes.data || []
  const todayApts = aptsRes.data || []
  const weekApts = weekAptsRes.data || []
  const monthPayments = paymentsRes.data || []

  return {
    todayAppointments: todayApts.length,
    todayRevenue: todayApts.reduce((s: number, a: Record<string, number>) => s + (a.total_amount - a.paid_amount), 0),
    newLeads: leads.filter((l: Record<string, string>) => l.status === 'new').length,
    pendingLeads: leads.filter((l: Record<string, boolean>) => l.no_reply_warning).length,
    monthRevenue: monthPayments.reduce((s: number, p: Record<string, number>) => s + p.amount, 0),
    upcomingWeek: weekApts.map(dbToAppointment),
  }
}

// ── MAPPERS ────────────────────────────────────────────────────
function dbToLead(r: Record<string, unknown>): Lead {
  return {
    id: r.id as string, name: r.name as string, phone: r.phone as string,
    status: r.status as Lead['status'], clientType: r.client_type as Lead['clientType'],
    eventType: r.event_type as Lead['eventType'], eventDate: r.event_date as string,
    location: r.location as string, companions: r.companions as number,
    heardFrom: r.heard_from as string, notes: r.notes as string,
    source: r.source as string, noReplyWarning: r.no_reply_warning as boolean,
    createdAt: r.created_at as string, updatedAt: r.updated_at as string,
  }
}

function leadToDb(l: Partial<Lead>): Record<string, unknown> {
  return {
    name: l.name, phone: l.phone, status: l.status,
    client_type: l.clientType, event_type: l.eventType,
    event_date: l.eventDate, location: l.location,
    companions: l.companions, heard_from: l.heardFrom,
    notes: l.notes, source: l.source || 'whatsapp',
    no_reply_warning: l.noReplyWarning || false,
  }
}

function dbToClient(r: Record<string, unknown>): Client {
  return {
    id: r.id as string, name: r.name as string, phone: r.phone as string,
    clientType: r.client_type as Client['clientType'], eventType: r.event_type as Client['eventType'],
    eventDate: r.event_date as string, location: r.location as string,
    companions: r.companions as number, heardFrom: r.heard_from as string,
    notes: r.notes as string, totalAmount: r.total_amount as number,
    paidAmount: r.paid_amount as number, paymentStatus: r.payment_status as Client['paymentStatus'],
    createdAt: r.created_at as string, leadId: r.lead_id as string,
  }
}

function dbToAppointment(r: Record<string, unknown>): Appointment {
  return {
    id: r.id as string, clientId: r.client_id as string,
    clientName: r.client_name as string, phone: r.phone as string,
    date: r.date as string, time: r.time as string,
    eventType: r.event_type as Appointment['eventType'],
    clientType: r.client_type as Appointment['clientType'],
    location: r.location as string, companions: r.companions as number,
    notes: r.notes as string, totalAmount: r.total_amount as number,
    paidAmount: r.paid_amount as number,
    paymentStatus: r.payment_status as Appointment['paymentStatus'],
    confirmed: r.confirmed as boolean,
  }
}

function aptToDb(a: Partial<Appointment>): Record<string, unknown> {
  return {
    client_id: a.clientId, client_name: a.clientName, phone: a.phone,
    date: a.date, time: a.time, event_type: a.eventType,
    client_type: a.clientType, location: a.location,
    companions: a.companions, notes: a.notes,
    total_amount: a.totalAmount, paid_amount: a.paidAmount,
    payment_status: a.paymentStatus, confirmed: a.confirmed || false,
  }
}

function dbToPayment(r: Record<string, unknown>): Payment {
  return {
    id: r.id as string, clientId: r.client_id as string,
    clientName: r.client_name as string, amount: r.amount as number,
    type: r.type as Payment['type'], method: r.method as Payment['method'],
    date: r.date as string, receiptNumber: r.receipt_number as string,
    notes: r.notes as string,
  }
}
