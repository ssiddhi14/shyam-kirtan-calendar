-- Add photo_url column to bookings table
ALTER TABLE public.bookings ADD COLUMN photo_url text;

-- Create storage bucket for booking photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('booking-photos', 'booking-photos', true);

-- Allow authenticated users to upload to the bucket
CREATE POLICY "Authenticated users can upload booking photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'booking-photos');

-- Allow anyone to view booking photos
CREATE POLICY "Anyone can view booking photos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'booking-photos');

-- Allow authenticated users to delete booking photos
CREATE POLICY "Authenticated users can delete booking photos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'booking-photos');