import { NextRequest, NextResponse } from 'next/server'
import { getLeads, createLead, updateLead, deleteLead, closeLeadAsClient } from '@/lib/store'

export async function GET() {
  const leads = await getLeads()
  return NextResponse.json(leads)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  if (body.action === 'close') {
    const client = await closeLeadAsClient(body.leadId)
    return NextResponse.json(client)
  }
  const lead = await createLead({ ...body, source: body.source || 'whatsapp' })
  return NextResponse.json(lead, { status: 201 })
}

export async function PATCH(req: NextRequest) {
  const body = await req.json()
  const { id, ...data } = body
  const lead = await updateLead(id, data)
  return NextResponse.json(lead)
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')!
  await deleteLead(id)
  return NextResponse.json({ success: true })
}
