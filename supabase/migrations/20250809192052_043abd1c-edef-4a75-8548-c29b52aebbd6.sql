-- Ensure full row data for realtime
ALTER TABLE public.transactions REPLICA IDENTITY FULL;