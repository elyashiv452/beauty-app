import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const tomorrowStr = tomorrow.toISOString().split('T')[0]

  const { data: appointments } = await supabase
    .from('appointments')
    .select('*')
    .eq('date', tomorrowStr)
    .order('time')

  const hasAppointments = appointments && appointments.length > 0

  if (!hasAppointments) {
    return NextResponse.json({ type: 'tip', appointments: [] })
  }

  const totalRevenue = appointments.reduce((s: number, a: Record<string, number>) => 
    s + (a.total_amount - a.paid_amount), 0)

  return NextResponse.json({
    type: 'summary',
    date: tomorrowStr,
    appointments,
    totalRevenue,
  })
}
