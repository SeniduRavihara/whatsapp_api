import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function POST(request: Request) {
  try {
    const { phone } = await request.json();

    if (!phone) {
      return new NextResponse('Phone is required', { status: 400 });
    }

    // Fetch chat history
    const { data: messages } = await supabaseAdmin
      .from('messages')
      .select('text, sender, created_at')
      .eq('contact_phone', phone)
      .order('created_at', { ascending: true })
      .limit(50); // Get last 50 messages for summary

    if (!messages || messages.length === 0) {
      return new NextResponse('No messages to summarize', { status: 400 });
    }

    // Format transcript
    const transcript = messages.map(m => 
      `[${m.created_at}] ${m.sender === 'me' ? 'Agent' : 'Client'}: ${m.text}`
    ).join('\n');

    // MOCK AI SUMMARY (Since no AI key is provided yet, we generate a mock)
    // In a real scenario, you would send `transcript` to OpenAI/Gemini
    const aiSummary = `Auto-generated mock summary based on ${messages.length} messages:\n\nThe client initiated contact about services. The agent responded with information and pricing. Pending further discussion.`;

    // Save summary to contact
    await supabaseAdmin
      .from('contacts')
      .update({ ai_summary: aiSummary })
      .eq('phone', phone);

    return NextResponse.json({ summary: aiSummary });
  } catch (error) {
    console.error('Summary API Error:', error);
    return new NextResponse('Error', { status: 500 });
  }
}
