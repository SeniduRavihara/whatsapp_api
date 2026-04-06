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
