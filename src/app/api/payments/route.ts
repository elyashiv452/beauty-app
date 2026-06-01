import { NextRequest, NextResponse } from 'next/server'
import { getPayments, recordPayment } from '@/lib/store'

export async function GET() {
  const payments = await getPayments()
  return NextResponse.json(payments)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const payment = await recordPayment(body)
  return NextResponse.json(payment, { status: 201 })
}
