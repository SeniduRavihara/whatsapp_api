import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

// Use environment variables for WhatsApp Business API
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;

if (!WHATSAPP_TOKEN || !PHONE_NUMBER_ID) {
  const missing = [];
  if (!WHATSAPP_TOKEN) missing.push("WHATSAPP_TOKEN");
  if (!PHONE_NUMBER_ID) missing.push("WHATSAPP_PHONE_NUMBER_ID");
  console.error(
    `❌ CRITICAL: Missing environment variables: ${missing.join(", ")}`
  );
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phone, text, type = "text", mediaUrl, mimeType, caption } = body;

    if (!phone || (!text && !mediaUrl)) {
      return new NextResponse("Phone and content are required", {
        status: 400,
      });
    }

    // 1. Send message via Meta Cloud API
    const url = `https://graph.facebook.com/v22.0/${PHONE_NUMBER_ID}/messages`;

    console.log(`📡 Sending to Meta... URL: ${url}`);

    let messagePayload: any = {
      messaging_product: "whatsapp",
      to: phone,
      type: type,
    };

    if (type === "text") {
      messagePayload.text = { body: text };
    } else if (
      ["image", "document", "audio", "video"].includes(type) &&
      mediaUrl
    ) {
      messagePayload[type] = { link: mediaUrl };
      if (caption) {
        messagePayload[type].caption = caption;
      }
    } else {
      return new NextResponse("Invalid message type or missing media url", {
        status: 400,
      });
    }

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${WHATSAPP_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(messagePayload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Meta API Error:", data);
      return new NextResponse(JSON.stringify(data), {
        status: response.status,
      });
    }

    const wa_id = data.messages?.[0]?.id;

    // 2. Save message to Supabase
    const { error: msgError } = await supabaseAdmin.from("messages").insert({
      wa_id: wa_id,
      contact_phone: phone,
      text: type === "text" ? text : caption || "",
      message_type: type,
      media_url: mediaUrl || null,
      mime_type: mimeType || null,
      caption: caption || null,
      sender: "me",
      status: "sent",
    });

    if (msgError) console.error("Supabase Error:", msgError);

    // 3. Update contact's last message
    await supabaseAdmin
      .from("contacts")
      .update({
        last_message: type === "text" ? text : `📷 ${type}`,
        last_message_at: new Date().toISOString(),
      })
      .eq("phone", phone);

    return new NextResponse(JSON.stringify(data), { status: 200 });
  } catch (error) {
    console.error("Send API Error:", error);
    return new NextResponse("Error", { status: 500 });
  }
}
