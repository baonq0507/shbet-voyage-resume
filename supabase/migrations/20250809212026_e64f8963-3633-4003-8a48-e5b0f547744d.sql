-- Fix RLS policies for transactions table
DROP POLICY IF EXISTS "Admins can insert all transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can create their own transactions" ON public.transactions;

-- Create proper INSERT policies
CREATE POLICY "Admins can insert all transactions" 
ON public.transactions 
FOR INSERT 
TO public 
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can create their own transactions" 
ON public.transactions 
FOR INSERT 
TO public 
WITH CHECK (auth.uid() = user_id);