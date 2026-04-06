export interface Contact {
  id: string;
  phone: string;
  name: string;
  last_message: string;
  last_message_at: string;
  unread_count: number;
}

export interface Message {
  id: string;
  wa_id: string;
  contact_phone: string;
  text: string;
  sender: 'me' | 'them';
  status: 'sent' | 'delivered' | 'read';
  created_at: string;
}
