-- Create a security definer function to check if current user is whitelisted
CREATE OR REPLACE FUNCTION public.is_user_whitelisted()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.whitelisted_users w
    WHERE w.email = (SELECT email FROM auth.users WHERE id = auth.uid())
  )
$$;

-- Drop existing booking policies that use direct auth.users access
DROP POLICY IF EXISTS "Whitelisted users can create bookings" ON public.bookings;
DROP POLICY IF EXISTS "Creators can update their own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Creators can delete their own bookings" ON public.bookings;

-- Recreate policies using the security definer function
CREATE POLICY "Whitelisted users can create bookings" 
ON public.bookings 
FOR INSERT 
WITH CHECK (
  auth.uid() IS NOT NULL AND
  public.is_user_whitelisted()
);

CREATE POLICY "Creators can update their own bookings" 
ON public.bookings 
FOR UPDATE 
USING (
  auth.uid() = created_by AND
  public.is_user_whitelisted()
);

CREATE POLICY "Creators can delete their own bookings" 
ON public.bookings 
FOR DELETE 
USING (
  auth.uid() = created_by AND
  public.is_user_whitelisted()
);