export type LeadStatus = 'new' | 'contacted' | 'active' | 'quote' | 'closed' | 'lost'
export type ClientType = 'bride' | 'companion'
export type PaymentStatus = 'none' | 'deposit' | 'full'
export type EventType = 'wedding' | 'bat_mitzva' | 'event' | 'other'

export interface Lead {
  id: string
  name: string
  phone: string
  status: LeadStatus
  clientType: ClientType
  eventType: EventType
  eventDate?: string
  location?: string
  companions: number
  heardFrom?: string
  notes?: string
  source: string
  createdAt: string
  updatedAt: string
  noReplyWarning?: boolean
}

export interface Client {
  id: string
  name: string
  phone: string
  clientType: ClientType
  eventType: EventType
  eventDate?: string
  location?: string
  companions: number
  heardFrom?: string
  notes?: string
  totalAmount: number
  paidAmount: number
  paymentStatus: PaymentStatus
  createdAt: string
  leadId?: string
}

export interface Appointment {
  id: string
  clientId: string
  clientName: string
  phone: string
  date: string
  time: string
  eventType: EventType
  clientType: ClientType
  location?: string
  companions: number
  notes?: string
  totalAmount: number
  paidAmount: number
  paymentStatus: PaymentStatus
  confirmed?: boolean
}

export interface Payment {
  id: string
  clientId: string
  clientName: string
  amount: number
  type: 'deposit' | 'balance' | 'full'
  method: 'bit' | 'paybox' | 'transfer' | 'cash'
  date: string
  receiptNumber: string
  notes?: string
}

export interface DashboardStats {
  todayAppointments: number
  todayRevenue: number
  newLeads: number
  pendingLeads: number
  monthRevenue: number
  upcomingWeek: Appointment[]
}
