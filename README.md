# Stitch: Professional WhatsApp Business CRM 🚀

Stitch is a high-density, "AWS-inspired" WhatsApp Business Power Inbox. Built for performance and high-volume communication, it transforms the Meta Cloud API into a professional CRM experience.

## 💎 Key Features
- **High-Density Console**: A utilitarian terminal-style UI designed for rapid multitasking.
- **Permanent Multimedia Pipeline**: Automatically captures image, video, and document assets from Meta and stores them permanently in **Supabase Storage**.
- **Real-Time Multi-Chat Engine**: Webhook-driven conversation list that scales naturally as new customers message the business.
- **Smart Statuses**: Real-time read receipts, unread badges, and delivery status tracking.
- **Enterprise Storage**: No more 5-minute link expirations; assets are hosted on your own public Supabase bucket.

---

## 🛠️ Performance Architecture
- **Framework**: Next.js 15+ (App Router)
- **Database**: Supabase (PostgreSQL) with Row Level Security.
- **Real-Time**: Supabase Postgres Subscriptions for instant message delivery.
- **Storage**: Supabase Storage for binary asset hosting.
- **API**: Meta WhatsApp Cloud API (v21.0).

---

## 🚀 Getting Started

### 1. Environment Configuration
Create a `.env.local` file with the following keys:
```env
# Meta WhatsApp API
WHATSAPP_TOKEN=your_permanent_or_temp_access_token
WHATSAPP_PHONE_NUMBER_ID=your_id
WHATSAPP_VERIFY_TOKEN=your_custom_string

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
SUPABASE_SERVICE_ROLE_KEY=your_admin_key
```

### 2. Database & Storage Setup
Ensure your Supabase project has:
1. The `contacts` and `messages` tables (see `supabase_schema.sql`).
2. A **Public** Bucket named **`whatsapp_media`** in Supabase Storage.

### 3. Meta Webhook Configuration
1. Point your Meta Webhook URL to: `https://your-domain.com/api/whatsapp/webhook`.
2. Ensure you are **Subscribed** to the **`messages`** field in the Meta Dashboard.

---

## 🧪 Testing Multi-Chat (Sandbox Mode)
If you are in Sandbox/Development mode, Meta only sends messages from "Verified" numbers:
1. Go to **WhatsApp** -> **Getting Started** in Meta Dashboard.
2. Add your testing numbers to the **Recipient List**.
3. Message the business from any of those numbers—they will instantly appear as new chats in the Stitch sidebar!

---

## 🛡️ License
Built for Enterprise Communication. All rights reserved.
