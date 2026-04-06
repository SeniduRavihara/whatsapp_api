import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

// HARDCODED CREDENTIALS (TO FORCE A FIX)
const PHONE_NUMBER_ID = "1078540015338881";
const WHATSAPP_TOKEN = "EAAcTjkUHW0QBRIX5aKZCuXDcVpAwmt7U9Olwur169LMQOzB2nX1Hjm8QAZAW6PWPUOtypRbSquMQcRFNTs7f1rGZCvTQzgrEHd9w4One9mUwOKgrspYd0ZA77mk7CZAZBpr78OHzEnKhGOZAyZCjh2AZCEBi9ZCTJktRJKZCEnjsmXQLn0GSZBXwiCY56eSCaGJZC3KMmuMRpg9zdCmbpgMA8sMpD8HGSGONSRan0BOcjcdBM4uDiuZCskY4Rtu12hO9fT6E2S0g80SFjNBWwIVIUedNSW";

if (!WHATSAPP_TOKEN) {
  console.error("❌ CRITICAL: WHATSAPP_TOKEN is missing from environment variables!");
}
if (!PHONE_NUMBER_ID) {
  console.error("❌ CRITICAL: WHATSAPP_PHONE_NUMBER_ID is missing from environment variables!");
}

export async function POST(request: Request) {
  try {
    const { phone, text } = await request.json();

    if (!phone || !text) {
      return new NextResponse('Phone and text are required', { status: 400 });
    }

    // 1. Send message via Meta Cloud API
    const url = `https://graph.facebook.com/v22.0/${PHONE_NUMBER_ID}/messages`;
    
    console.log(`📡 Sending to Meta... URL: ${url}`);
    console.log(`🔑 Token Preview: ${WHATSAPP_TOKEN?.substring(0, 10)}... (Length: ${WHATSAPP_TOKEN?.length})`);

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

    const wa_id = data.messages?.[0]?.id;

    // 2. Save message to Supabase
    const { error: msgError } = await supabaseAdmin
      .from('messages')
      .insert({
        wa_id: wa_id,
        contact_phone: phone,
        text: text,
        sender: 'me',
        status: 'sent'
      });

    if (msgError) console.error('Supabase Error:', msgError);

    // 3. Update contact's last message
    await supabaseAdmin
      .from('contacts')
      .update({
        last_message: text,
        last_message_at: new Date().toISOString()
      })
      .eq('phone', phone);

    return new NextResponse(JSON.stringify(data), { status: 200 });
  } catch (error) {
    console.error('Send API Error:', error);
    return new NextResponse('Error', { status: 500 });
  }
}
