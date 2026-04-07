-- Set up Storage for Media
INSERT INTO storage.buckets (id, name, public) 
VALUES ('whatsapp_media', 'whatsapp_media', true)
ON CONFLICT (id) DO NOTHING;

-- Allow anonymous users to upload images (INSERT)
CREATE POLICY "Allow public uploads" 
ON storage.objects FOR INSERT 
TO public 
WITH CHECK (bucket_id = 'whatsapp_media');

-- Allow everyone to view images (SELECT)
CREATE POLICY "Allow public viewing" 
ON storage.objects FOR SELECT 
TO public 
USING (bucket_id = 'whatsapp_media');