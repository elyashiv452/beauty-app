import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

function generateId() { return Math.random().toString(36).substring(2, 10) }

export async function GET() {
  const [membersRes, jobsRes] = await Promise.all([
    supabase.from('team_members').select('*').eq('active', true).order('created_at'),
    supabase.from('team_jobs').select('*').order('event_date', { ascending: false }),
  ])
  return NextResponse.json({ members: membersRes.data || [], jobs: jobsRes.data || [] })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  if (body.action === 'add_member') {
    const { data, error } = await supabase.from('team_members').insert({
      id: generateId(), name: body.name, phone: body.phone, email: body.email,
      commission_percent: body.commission_percent || 20,
    }).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data, { status: 201 })
  }
  if (body.action === 'add_job') {
    const commission = Math.round((body.total_amount * body.commission_percent) / 100)
    const { data, error } = await supabase.from('team_jobs').insert({
      id: generateId(), member_id: body.member_id, client_name: body.client_name,
      event_type: body.event_type || 'wedding', client_type: body.client_type || 'bride',
      event_date: body.event_date, location: body.location,
      companions: body.companions || 0, total_amount: body.total_amount,
      commission_amount: commission, paid_to_member: false,
    }).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data, { status: 201 })
  }
  if (body.action === 'mark_paid') {
    await supabase.from('team_jobs').update({ paid_to_member: true }).eq('id', body.job_id)
    return NextResponse.json({ success: true })
  }
  if (body.action === 'update_commission') {
    await supabase.from('team_members').update({ commission_percent: body.commission_percent }).eq('id', body.member_id)
    return NextResponse.json({ success: true })
  }
  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')!
  await supabase.from('team_members').update({ active: false }).eq('id', id)
  return NextResponse.json({ success: true })
}
