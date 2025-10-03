-- Create storage bucket for hotel and room images
INSERT INTO storage.buckets (id, name, public)
VALUES ('hotel-images', 'hotel-images', true);

-- Allow admins to upload images
CREATE POLICY "Admins can upload hotel images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'hotel-images' 
  AND has_role(auth.uid(), 'admin'::app_role)
);

-- Allow admins to update images
CREATE POLICY "Admins can update hotel images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'hotel-images' 
  AND has_role(auth.uid(), 'admin'::app_role)
);

-- Allow admins to delete images
CREATE POLICY "Admins can delete hotel images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'hotel-images' 
  AND has_role(auth.uid(), 'admin'::app_role)
);

-- Allow public read access to images
CREATE POLICY "Hotel images are publicly accessible"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'hotel-images');