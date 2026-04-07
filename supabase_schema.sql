-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create Contacts Table
CREATE TABLE IF NOT EXISTS contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone TEXT UNIQUE NOT NULL,
    name TEXT,
    last_message TEXT,
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    unread_count INTEGER DEFAULT 0,
    internal_notes TEXT,
    ai_summary TEXT,
    tags JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

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

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_messages_contact_phone ON messages(contact_phone);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);

-- Enable Realtime for these tables
ALTER PUBLICATION supabase_realtime ADD TABLE contacts;
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
