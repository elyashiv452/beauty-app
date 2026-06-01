import { NextRequest, NextResponse } from 'next/server'
import { getAppointments, createAppointment, updateAppointment } from '@/lib/store'

export async function GET() {
  const apts = await getAppointments()
  return NextResponse.json(apts)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const apt = await createAppointment(body)
  return NextResponse.json(apt, { status: 201 })
}

export async function PATCH(req: NextRequest) {
  const body = await req.json()
  const { id, ...data } = body
  const apt = await updateAppointment(id, data)
  return NextResponse.json(apt)
}
