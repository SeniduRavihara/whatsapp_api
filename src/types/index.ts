export interface Contact {
  id: string;
  phone: string;
  name: string;
  last_message: string;
  last_message_at: string;
  unread_count: number;
  internal_notes?: string;
  ai_summary?: string;
  tags?: string[];
  avatar_url?: string;
  description?: string;
}

export interface Message {
  id: string;
  wa_id: string;
  contact_phone: string;
  text?: string;
  message_type:
    | "text"
    | "image"
    | "video"
    | "audio"
    | "document"
    | "sticker"
    | "location";
  media_url?: string;
  mime_type?: string;
  caption?: string;
  sender: "me" | "them";
  status: "sent" | "delivered" | "read";
  created_at: string;
}
