import { NextRequest, NextResponse } from 'next/server'
import { store, createClient, updateClient } from '@/lib/store'

export async function GET() {
  return NextResponse.json(store.clients)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const client = createClient(body)
  return NextResponse.json(client, { status: 201 })
}

export async function PATCH(req: NextRequest) {
  const body = await req.json()
  const { id, ...data } = body
  const client = updateClient(id, data)
  if (!client) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(client)
}
