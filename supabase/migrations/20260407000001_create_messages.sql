-- Create Messages Table
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wa_id TEXT UNIQUE, -- WhatsApp's unique message ID
    contact_phone TEXT REFERENCES contacts(phone) ON DELETE CASCADE,
    text TEXT,
    message_type TEXT DEFAULT 'text', -- text, image, video, document, etc.
    media_url TEXT,
    mime_type TEXT,
    caption TEXT,
    sender TEXT CHECK (sender IN ('me', 'them')),
    status TEXT DEFAULT 'sent', -- sent, delivered, read
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indices for faster lookups
CREATE INDEX IF NOT EXISTS idx_messages_contact_phone ON messages(contact_phone);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);

-- Enable Realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE messages;