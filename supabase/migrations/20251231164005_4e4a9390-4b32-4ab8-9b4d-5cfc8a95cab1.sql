-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Authenticated users can check whitelist" ON public.whitelisted_users;

-- Create a policy that allows anyone to check if an email is whitelisted
CREATE POLICY "Anyone can check whitelist" 
ON public.whitelisted_users 
FOR SELECT 
USING (true);