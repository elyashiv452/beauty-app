import { NextRequest, NextResponse } from 'next/server'
import { store, createAppointment, updateAppointment } from '@/lib/store'

export async function GET() {
  return NextResponse.json(store.appointments)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const apt = createAppointment(body)
  return NextResponse.json(apt, { status: 201 })
}

export async function PATCH(req: NextRequest) {
  const body = await req.json()
  const { id, ...data } = body
  const apt = updateAppointment(id, data)
  if (!apt) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(apt)
}
