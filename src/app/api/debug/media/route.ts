import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const media_id = searchParams.get('mediaId');
  const token = process.env.WHATSAPP_TOKEN;

  if (!media_id) return NextResponse.json({ error: 'Missing mediaId parameter' }, { status: 400 });
  if (!token) return NextResponse.json({ error: 'Missing WHATSAPP_TOKEN in .env.local' }, { status: 500 });

  try {
    const results: any = { step: 'start', media_id };

    // 1. Meta Metadata
    const metaUrl = `https://graph.facebook.com/v17.0/${media_id}`;
    const metaRes = await fetch(metaUrl, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    results.metaStatus = metaRes.status;
    results.metaData = await metaRes.json();

    if (!results.metaData.url) {
      return NextResponse.json({ error: 'Meta failed to provide URL', results }, { status: 400 });
    }

    // 2. Download
    const downloadRes = await fetch(results.metaData.url, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    results.downloadStatus = downloadRes.status;
    if (!downloadRes.ok) {
      return NextResponse.json({ error: 'Download failed', results }, { status: 400 });
    }

    const buffer = await downloadRes.arrayBuffer();
    results.downloadedBytes = buffer.byteLength;

    // 3. Supabase Storage
    const fileName = `debug-${Date.now()}.${results.metaData.mime_type?.split('/')[1] || 'bin'}`;
    const { data: uploadData, error: uploadError } = await supabaseAdmin
      .storage
      .from('whatsapp_media')
      .upload(fileName, buffer, {
        contentType: results.metaData.mime_type,
        upsert: true
      });

    if (uploadError) {
      results.uploadError = uploadError;
      return NextResponse.json({ error: 'Supabase upload failed', results }, { status: 500 });
    }

    // 4. Public URL
    const { data: publicUrlData } = supabaseAdmin
      .storage
      .from('whatsapp_media')
      .getPublicUrl(fileName);

    results.finalUrl = publicUrlData.publicUrl;
    return NextResponse.json({ success: true, results });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
