import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase with Service Role Key for server-side operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN;

// 1. Verification Endpoint (GET)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('Webhook verified successfully!');
    return new NextResponse(challenge, { status: 200 });
  }

  return new NextResponse('Forbidden', { status: 403 });
}

// 2. Incoming Message Handler (POST)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Log the entire body for EASY testing in your console/logs
    console.log('✅ NEW WHATSAPP WEBHOOK RECEIVED:', JSON.stringify(body, null, 2));

    // Check if it's a valid WhatsApp message event
    if (body.object === 'whatsapp_business_account') {
      const entry = body.entry?.[0];
      const changes = entry?.changes?.[0];
      const value = changes?.value;

      if (value?.messages) {
        console.log('💬 Message Body:', value.messages[0].text?.body);
      }

      return new NextResponse('OK', { status: 200 });
    }

    return new NextResponse('Not a WhatsApp event', { status: 404 });
  } catch (error) {
    console.error('❌ Webhook Error:', error);
    return new NextResponse('Error', { status: 500 });
  }
}
