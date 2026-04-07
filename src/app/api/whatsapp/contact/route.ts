import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function PATCH(request: Request) {
  try {
    const { phone, ...updates } = await request.json();

    if (!phone) {
      return new NextResponse('Phone is required', { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('contacts')
      .update(updates)
      .eq('phone', phone);

    if (error) {
      console.error('Contact Update Error:', error);
      return new NextResponse(error.message, { status: 500 });
    }

    return new NextResponse('OK', { status: 200 });
  } catch (error) {
    console.error('API Error:', error);
    return new NextResponse('Error', { status: 500 });
  }
}
