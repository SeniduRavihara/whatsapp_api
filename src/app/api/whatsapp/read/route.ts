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
    const { phone } = await request.json();

    if (!phone) {
      return new NextResponse('Phone is required', { status: 400 });
    }

    // Reset unread_count in Supabase
    await supabaseAdmin
      .from('contacts')
      .update({ unread_count: 0 })
      .eq('phone', phone);

    // Get the most recent unread message from them to mark as read in Meta
    const { data: messages } = await supabaseAdmin
      .from('messages')
      .select('wa_id')
      .eq('contact_phone', phone)
      .eq('sender', 'them')
      .neq('status', 'read')
      .order('created_at', { ascending: false })
      .limit(1);

    if (messages && messages.length > 0 && messages[0].wa_id) {
      const wa_id = messages[0].wa_id;

      // Send read receipt via Meta Cloud API
      const url = `https://graph.facebook.com/v22.0/${PHONE_NUMBER_ID}/messages`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          status: 'read',
          message_id: wa_id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Meta API Read Receipt Error:', errorData);
      } else {
        // Optimistically update statuses of older messages to 'read' as well
        await supabaseAdmin
          .from('messages')
          .update({ status: 'read' })
          .eq('contact_phone', phone)
          .eq('sender', 'them')
          .neq('status', 'read');
      }
    }

    return new NextResponse('OK', { status: 200 });
  } catch (error) {
    console.error('Read API Error:', error);
    return new NextResponse('Error', { status: 500 });
  }
}
