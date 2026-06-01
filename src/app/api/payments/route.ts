import { NextRequest, NextResponse } from 'next/server'
import { store, recordPayment } from '@/lib/store'

export async function GET() {
  return NextResponse.json(store.payments)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const payment = recordPayment(body)
  return NextResponse.json(payment, { status: 201 })
}
