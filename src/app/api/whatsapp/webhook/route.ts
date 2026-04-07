import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

// Initialize Supabase with Service Role Key for server-side operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN;

// 1. Verification Endpoint (GET)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("Webhook verified successfully!");
    return new NextResponse(challenge, { status: 200 });
  }

  return new NextResponse("Forbidden", { status: 403 });
}

// 2. Incoming Message Handler (POST)
export async function POST(request: Request) {
  try {
    const body = await request.json();

    console.log("✅ WEBHOOK RECEIVED:", JSON.stringify(body, null, 2));

    // Check if it's a valid WhatsApp message event
    if (body.object === "whatsapp_business_account") {
      const entry = body.entry?.[0];
      const changes = entry?.changes?.[0];
      const value = changes?.value;

      // Handle actual messages
      if (value?.messages) {
        for (const message of value.messages) {
          const from = message.from;
          const wa_id = message.id;
          const messageType = message.type || "text";
          const senderName = value.contacts?.[0]?.profile?.name || "Unknown";

          let text = message.text?.body || "";
          let mediaUrl = null;
          let mimeType = null;
          let caption = null;

          // Handle Multimedia and Special Types
          if (messageType !== "text") {
            const mediaData = message[messageType];
            
            if (messageType === "audio" || messageType === "document" || messageType === "image" || messageType === "video") {
              if (mediaData) {
                const media_id = mediaData.id;
                const phone_number_id = value.metadata?.phone_number_id;
                caption = mediaData.caption || null;
                mimeType = mediaData.mime_type || null;
                const direct_url = mediaData.url;
                
                // For documents, try to get the filename
                if (messageType === "document" && mediaData.filename) {
                  caption = mediaData.filename; // Use filename as caption if not provided
                }

                mediaUrl = await getMediaUrl(media_id, phone_number_id, direct_url);
                text = caption || `[${messageType}]`;
              }
            } else if (messageType === "location") {
              const loc = message.location;
              // Format: lat,lng,name,address
              text = `${loc.latitude},${loc.longitude},${loc.name || ""},${loc.address || ""}`;
            } else if (messageType === "contacts") {
              const contact = message.contacts?.[0];
              const name = contact?.name?.formatted_name || contact?.name?.first_name || "Contact";
              const phone = contact?.phones?.[0]?.phone || "";
              text = `${name}|${phone}`; // Format for UI parsing
            }
          }

          // 1. Ensure contact exists and increment unread count
          const { data: existingContact } = await supabaseAdmin
            .from("contacts")
            .select("unread_count, name")
            .eq("phone", from)
            .single();

          const newUnreadCount = (existingContact?.unread_count || 0) + 1;
          const finalName = senderName !== 'Unknown' ? senderName : (existingContact?.name || from);

          const { error: contactError } = await supabaseAdmin
            .from('contacts')
            .upsert(
              { 
                phone: from, 
                name: finalName,
                last_message: text,
                last_message_at: new Date().toISOString(),
                unread_count: newUnreadCount
              },
              { onConflict: 'phone' }
            );

          if (contactError) console.error('Contact Upsert Error:', contactError);

          // 2. Insert message into Supabase
          const { error: msgError } = await supabaseAdmin
            .from("messages")
            .insert({
              wa_id: wa_id,
              contact_phone: from,
              text: text,
              message_type: messageType,
              media_url: mediaUrl,
              mime_type: mimeType,
              caption: caption,
              sender: "them",
              status: "delivered",
            });

          if (msgError && msgError.code !== "23505") {
            console.error("Message Insert Error:", msgError);
          }
        }
      }

      // Handle message status updates
      if (value?.statuses) {
        for (const statusUpdate of value.statuses) {
          const wa_id = statusUpdate.id;
          const status = statusUpdate.status;

          await supabaseAdmin
            .from("messages")
            .update({ status: status })
            .eq("wa_id", wa_id);
        }
      }

      return new NextResponse("OK", { status: 200 });
    }

    return new NextResponse("Not a WhatsApp event", { status: 404 });
  } catch (error) {
    console.error("❌ Webhook Error:", error);
    return new NextResponse("Error", { status: 500 });
  }
}

async function getMediaUrl(
  media_id: string,
  phone_number_id?: string,
  direct_url?: string
) {
  try {
    const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
    if (!WHATSAPP_TOKEN) {
      console.error("❌ NO TOKEN FOUND IN ENV");
      return null;
    }

    let metaUrl = direct_url;
    let contentType = null;

    if (!metaUrl) {
      // 1. Get Meta Media Metadata (v21.0 + scoping)
      let fetchUrl = `https://graph.facebook.com/v21.0/${media_id}`;
      if (phone_number_id) {
        fetchUrl += `?phone_number_id=${phone_number_id}`;
      }

      console.log(
        `📡 Fetching Meta URL for ${media_id} (Scoping: ${phone_number_id})...`
      );

      const metaRes = await fetch(fetchUrl, {
        headers: {
          Authorization: `Bearer ${WHATSAPP_TOKEN}`,
          "User-Agent": "Stitch-CRM/1.0",
        },
      });

      const metaData = await metaRes.json();
      console.log("📦 META RAW DATA:", JSON.stringify(metaData, null, 2));

      if (!metaData.url) {
        console.error("❌ Meta failed to provide a URL. Response:", metaData);
        return null;
      }
      metaUrl = metaData.url;
      contentType = metaData.mime_type;
    } else {
      console.log(`⏭️ Skipping Meta URL fetch, using direct_url from webhook`);
    }

    // 2. Download Binary Data
    console.log("⬇️ Downloading binary from Meta...");
    const downloadRes = await fetch(metaUrl as string, {
      headers: {
        Authorization: `Bearer ${WHATSAPP_TOKEN}`,
        "User-Agent": "Stitch-CRM/1.0",
      },
    });

    if (!downloadRes.ok) {
      const errorText = await downloadRes.text();
      console.error(
        `❌ Download failed with status: ${downloadRes.status} ${errorText}`
      );
      return null;
    }

    const arrayBuffer = await downloadRes.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    console.log(`✅ Downloaded ${buffer.byteLength} bytes`);

    // 3. Upload to Supabase Storage
    contentType =
      contentType ||
      downloadRes.headers.get("content-type") ||
      "application/octet-stream";
    const extension = contentType.split("/")[1] || "bin";
    const fileName = `${Date.now()}-${media_id}.${extension}`;
    console.log(`📤 Uploading to Supabase as ${fileName}...`);

    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from("whatsapp_media")
      .upload(fileName, buffer, {
        contentType: contentType,
        upsert: true,
      });

    if (uploadError) {
      console.error("❌ Supabase Upload Failed:", uploadError);
      return metaUrl; // Fallback to Meta URL if available
    }

    // 4. Get Public URL
    const { data: publicUrlData } = supabaseAdmin.storage
      .from("whatsapp_media")
      .getPublicUrl(fileName);

    console.log("✅ Upload successful:", publicUrlData.publicUrl);
    return publicUrlData.publicUrl;
  } catch (error) {
    console.error("❌ getMediaUrl Error:", error);
    return null;
  }
}
