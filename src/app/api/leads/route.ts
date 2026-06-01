import { NextRequest, NextResponse } from 'next/server'
import { store, createLead, updateLead, deleteLead, closeLeadAsClient } from '@/lib/store'

export async function GET() {
  return NextResponse.json(store.leads)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  if (body.action === 'close') {
    const client = closeLeadAsClient(body.leadId)
    if (!client) return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    return NextResponse.json(client)
  }
  const lead = createLead({ ...body, source: body.source || 'whatsapp' })
  return NextResponse.json(lead, { status: 201 })
}

export async function PATCH(req: NextRequest) {
  const body = await req.json()
  const { id, ...data } = body
  const lead = updateLead(id, data)
  if (!lead) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(lead)
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  const ok = deleteLead(id)
  if (!ok) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ success: true })
}
