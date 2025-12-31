-- Create bookings table
CREATE TABLE public.bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_date DATE NOT NULL UNIQUE,
  booked_by TEXT NOT NULL,
  kirtan_name TEXT NOT NULL,
  kirtan_place TEXT NOT NULL,
  booking_time TIME NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Create whitelist table for approved users
CREATE TABLE public.whitelisted_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on bookings
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Enable RLS on whitelisted_users
ALTER TABLE public.whitelisted_users ENABLE ROW LEVEL SECURITY;

-- Public read access for bookings (everyone can view)
CREATE POLICY "Anyone can view bookings" 
ON public.bookings 
FOR SELECT 
USING (true);

-- Only authenticated whitelisted users can insert bookings
CREATE POLICY "Whitelisted users can create bookings" 
ON public.bookings 
FOR INSERT 
WITH CHECK (
  auth.uid() IS NOT NULL AND
  EXISTS (
    SELECT 1 FROM public.whitelisted_users 
    WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
  )
);

-- Only the creator can update their own bookings
CREATE POLICY "Creators can update their own bookings" 
ON public.bookings 
FOR UPDATE 
USING (
  auth.uid() = created_by AND
  EXISTS (
    SELECT 1 FROM public.whitelisted_users 
    WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
  )
);

-- Only the creator can delete their own bookings
CREATE POLICY "Creators can delete their own bookings" 
ON public.bookings 
FOR DELETE 
USING (
  auth.uid() = created_by AND
  EXISTS (
    SELECT 1 FROM public.whitelisted_users 
    WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
  )
);

-- Whitelist read access for authenticated users only
CREATE POLICY "Authenticated users can check whitelist" 
ON public.whitelisted_users 
FOR SELECT 
TO authenticated
USING (true);

-- Add index for faster date lookups
CREATE INDEX idx_bookings_date ON public.bookings(booking_date);

-- Enable realtime for bookings
ALTER PUBLICATION supabase_realtime ADD TABLE public.bookings;