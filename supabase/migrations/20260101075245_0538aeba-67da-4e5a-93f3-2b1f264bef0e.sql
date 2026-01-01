-- Update delete policy to allow any whitelisted user to delete any booking
DROP POLICY IF EXISTS "Creators can delete their own bookings" ON public.bookings;

CREATE POLICY "Whitelisted users can delete bookings" 
ON public.bookings 
FOR DELETE 
TO authenticated
USING (is_user_whitelisted());