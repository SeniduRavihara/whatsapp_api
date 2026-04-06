import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;

export async function POST(request: Request) {
  try {
    const { phone, text } = await request.json();

    if (!phone || !text) {
      return new NextResponse('Phone and text are required', { status: 400 });
    }

    // 1. Send message via Meta Cloud API
    const url = `https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: phone,
        type: 'text',
        text: { body: text },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Meta API Error:', data);
      return new NextResponse(JSON.stringify(data), { status: response.status });
    }

    return new NextResponse(JSON.stringify(data), { status: 200 });
  } catch (error) {
    console.error('Send API Error:', error);
    return new NextResponse('Error', { status: 500 });
  }
}
