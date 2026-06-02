import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function OPTIONS() {
  return new NextResponse(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}

export async function POST(req: Request) {
  try {
    const { fname, lname, phone, email, wdate, pay } = await req.json()

    const { error } = await supabase.from('leads').insert({
      name: `${fname} ${lname}`,
      phone,
      email,
      event_date: wdate,
      payment_method: pay,
      source: 'landing_page',
      status: 'new'
    })

    if (error) throw error

    return NextResponse.json({ success: true }, {
      headers: { 'Access-Control-Allow-Origin': '*' }
    })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, {
      headers: { 'Access-Control-Allow-Origin': '*' }
    })
  }
}
