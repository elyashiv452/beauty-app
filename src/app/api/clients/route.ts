import { NextRequest, NextResponse } from 'next/server'
import { getClients, updateClient } from '@/lib/store'

export async function GET() {
  const clients = await getClients()
  return NextResponse.json(clients)
}

export async function PATCH(req: NextRequest) {
  const body = await req.json()
  const { id, ...data } = body
  const client = await updateClient(id, data)
  return NextResponse.json(client)
}
