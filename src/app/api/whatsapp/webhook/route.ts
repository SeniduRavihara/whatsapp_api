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

    // Check if it's a valid WhatsApp message event
    if (body.object === 'whatsapp_business_account') {
      const entry = body.entry?.[0];
      const changes = entry?.changes?.[0];
      const value = changes?.value;

      // Handle actual messages
      if (value?.messages) {
        for (const message of value.messages) {
          const from = message.from; // User's phone number
          const text = message.text?.body || '';
          const wa_id = message.id;
          const senderName = value.contacts?.[0]?.profile?.name || 'Unknown';

          // 1. Ensure contact exists in Supabase
          const { error: contactError } = await supabaseAdmin
            .from('contacts')
            .upsert(
              { 
                phone: from, 
                name: senderName,
                last_message: text,
                last_message_at: new Date().toISOString()
              },
              { onConflict: 'phone' }
            );

          if (contactError) console.error('Contact Upsert Error:', contactError);

          // 2. Insert message into Supabase
          const { error: msgError } = await supabaseAdmin
            .from('messages')
            .insert({
              wa_id: wa_id,
              contact_phone: from,
              text: text,
              sender: 'them',
              status: 'delivered'
            });

          if (msgError && msgError.code !== '23505') { // Ignore duplicate wa_id
            console.error('Message Insert Error:', msgError);
          }
        }
      }

      // Handle message status updates (sent, delivered, read)
      if (value?.statuses) {
        for (const statusUpdate of value.statuses) {
          const wa_id = statusUpdate.id;
          const status = statusUpdate.status;

          await supabaseAdmin
            .from('messages')
            .update({ status: status })
            .eq('wa_id', wa_id);
        }
      }

      return new NextResponse('OK', { status: 200 });
    }

    return new NextResponse('Not a WhatsApp event', { status: 404 });
  } catch (error) {
    console.error('Webhook Error:', error);
    return new NextResponse('Error', { status: 500 });
  }
}
